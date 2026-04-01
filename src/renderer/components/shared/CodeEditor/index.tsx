import { useEffect, useRef, useMemo, useCallback } from "react";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  Decoration,
  DecorationSet,
  ViewPlugin,
  ViewUpdate,
  MatchDecorator,
  WidgetType,
  hoverTooltip,
} from "@codemirror/view";
import { EditorState, Compartment } from "@codemirror/state";
import {
  defaultKeymap,
  history,
  historyKeymap,
  insertTab,
} from "@codemirror/commands";
import { json } from "@codemirror/lang-json";
import { xml } from "@codemirror/lang-xml";
import {
  syntaxHighlighting,
  HighlightStyle,
  bracketMatching,
} from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import {
  acceptCompletion,
  autocompletion,
  closeBrackets,
  CompletionContext,
  completionKeymap,
  CompletionResult,
  completionStatus,
} from "@codemirror/autocomplete";
import { cn } from "@/lib/utils";
import type { BodyType, Environment } from "@/types";
import { useSettingsStore } from "@/features/settings/settings.store";
import { useEnvStore } from "@/features/environments/environments.store";
import { GLOBAL_ENV_ID } from "@/features/environments/environments.constants";
import "./code-editor.css";

const VAR_RE = /\{\{([\w.-]+)\}\}/;

const languageConf = new Compartment();
const envDecorationsConf = new Compartment();
const autocompleteConf = new Compartment();
const themeConf = new Compartment();

class VariableWidget extends WidgetType {
  constructor(
    readonly name: string,
    readonly resolved: boolean,
  ) {
    super();
  }
  toDOM() {
    const span = document.createElement("span");
    span.className = `si-var ${this.resolved ? "resolved" : "unresolved"}`;
    span.textContent = `{{${this.name}}}`;
    return span;
  }
  eq(other: VariableWidget) {
    return other.name === this.name && other.resolved === this.resolved;
  }
}

const getLanguage = (type: BodyType) => {
  if (type === "json") return json();
  if (type === "xml") return xml();
  return [];
};

const eosHighlightStyle = HighlightStyle.define([
  { tag: t.propertyName, color: "var(--eos-accent)" },
  { tag: t.string, color: "var(--eos-post)" },
  { tag: t.number, color: "var(--eos-get)" },
  { tag: t.bool, color: "var(--eos-put)" },
  { tag: t.null, color: "var(--eos-options)" },
  { tag: t.keyword, color: "var(--eos-patch)" },
  { tag: t.punctuation, color: "var(--eos-muted)" },
  { tag: t.brace, color: "var(--eos-text)" },
  { tag: [t.tagName, t.angleBracket], color: "var(--eos-accent)" },
  { tag: t.attributeName, color: "var(--eos-get)" },
  { tag: t.comment, color: "var(--eos-muted-2)", fontStyle: "italic" },
]);

const getEosTheme = (fontSize: number, fontFamily: string) => {
  const quote = (f: string) => (f.startsWith("'") || f.startsWith("\"") ? f : `'${f}'`);
  const finalFont = `${quote(fontFamily)}, monospace`;

  return EditorView.theme({
    "&": {
      height: "100%",
      fontSize: `${fontSize}px`,
      fontFamily: finalFont,
      background: "var(--eos-bg)",
      color: "var(--eos-text)",
    },
  ".cm-content": {
    caretColor: "var(--eos-accent) !important",
    padding: "10px 0",
  },
  ".cm-cursor": { borderLeft: "2px solid var(--eos-accent) !important" },
  ".cm-gutters": {
    background: "var(--eos-bg)",
    border: "none",
    borderRight: "1px solid var(--eos-border)",
    color: "var(--eos-muted-2)",
    minWidth: "40px",
  },
  ".cm-activeLine": { background: "var(--eos-surface)" },
  "&.cm-focused .cm-selectionBackground, ::selection": {
    background: "var(--eos-accent-dim) !important",
  },

  ".cm-tooltip-autocomplete > ul": {
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    margin: "0",
    padding: "0",
    maxHeight: "200px",
    overflowY: "auto",
  },

  ".cm-tooltip-autocomplete > ul > li": {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "5px 10px",
    borderRadius: "3px",
    color: "var(--eos-text)",
    background: "transparent",
  },

  ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
    background: "var(--eos-surface-2) !important",
    color: "var(--eos-text) !important",
  },

  ".cm-completionLabel": {
    color: "var(--eos-accent)",
    fontFamily: "var(--font-mono)",
  },

  ".cm-completionDetail": {
    color: "var(--eos-muted)",
    fontSize: "11px",
    fontStyle: "normal",
    maxWidth: "160px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    marginLeft: "12px",
  },

  ".cm-completionIcon": {
    display: "none",
  },

  ".cm-tooltip": {
    border: "none !important",
    padding: "0 !important",
    background: "transparent !important",
  },
});
};

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  bodyType: BodyType;
  className?: string;
}

export function CodeEditor({
  value,
  onChange,
  bodyType,
  className,
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { environments, activeEnvId } = useEnvStore();
  const { fontSize, monoFontFamily } = useSettingsStore();

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const vars = useMemo(() => {
    const globalEnv = environments.find((e: Environment) => e.id === GLOBAL_ENV_ID);
    const activeEnv = environments.find((e: Environment) => e.id === activeEnvId);
    return { ...globalEnv?.variables, ...activeEnv?.variables };
  }, [environments, activeEnvId]);

  const varCompletion = useCallback(
    (context: CompletionContext): CompletionResult | null => {
      const word = context.matchBefore(/\{\{[\w.-]*/);
      if (!word) return null;
      if (word.from === word.to && !context.explicit) return null;
      return {
        from: word.from,
        options: Object.entries(vars).map(([name, val]) => ({
          label: `{{${name}}}`,
          displayLabel: name,
          detail: typeof val === "object" ? JSON.stringify(val) : String(val),
          type: "variable",
          apply: (view, _, from, to) => {
            const after = view.state.doc.sliceString(
              to,
              Math.min(to + 2, view.state.doc.length),
            );
            const insert = `{{${name}}}`;
            view.dispatch({
              changes: { from, to: after === "}}" ? to + 2 : to, insert },
              selection: { anchor: from + insert.length },
            });
          },
        })),
        filter: true,
      };
    },
    [vars],
  );

  const varHover = useMemo(
    () =>
      hoverTooltip(
        (view, pos) => {
          const line = view.state.doc.lineAt(pos);
          const matches = line.text.matchAll(new RegExp(VAR_RE.source, "g"));
          for (const m of matches) {
            const start = line.from + m.index!;
            const end = start + m[0].length;
            if (pos >= start && pos <= end) {
              const val = vars[m[1]];
              if (!val) return null;
              return {
                pos: start,
                end,
                above: true,
                create() {
                  const dom = document.createElement("div");
                  dom.className = "si-tooltip";
                  dom.textContent = typeof val === "object" ? JSON.stringify(val) : String(val);
                  return { dom };
                },
              };
            }
          }
          return null;
        },
        { hoverTime: 300 },
      ),
    [vars],
  );

  const varPlugin = useMemo(() => {
    const decorator = new MatchDecorator({
      regexp: new RegExp(VAR_RE.source, "g"),
      decoration: (match) =>
        Decoration.replace({
          widget: new VariableWidget(match[1], match[1] in vars),
        }),
    });
    return ViewPlugin.fromClass(
      class {
        decorations: DecorationSet;
        constructor(view: EditorView) {
          this.decorations = decorator.createDeco(view);
        }
        update(update: ViewUpdate) {
          this.decorations = decorator.updateDeco(update, this.decorations);
        }
      },
      { decorations: (v) => v.decorations },
    );
  }, [vars]);

  useEffect(() => {
    if (!containerRef.current) return;
    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          themeConf.of(getEosTheme(fontSize, monoFontFamily)),
          syntaxHighlighting(eosHighlightStyle),
          lineNumbers(),
          highlightActiveLine(),
          bracketMatching(),
          closeBrackets(),
          history(),
          languageConf.of(getLanguage(bodyType)),
          envDecorationsConf.of(varPlugin),
          autocompleteConf.of(autocompletion({ override: [varCompletion] })),
          varHover,
          keymap.of([
            {
              key: "Tab",
              run: (v) =>
                completionStatus(v.state) === "active"
                  ? acceptCompletion(v)
                  : insertTab(v),
            },
            ...completionKeymap.filter((b) => b.key !== "Tab"),
            ...defaultKeymap,
            ...historyKeymap,
          ]),
          EditorView.lineWrapping,
          EditorView.updateListener.of((u) => {
            if (u.docChanged) onChangeRef.current(u.state.doc.toString());
          }),
        ],
      }),
      parent: containerRef.current,
    });
    viewRef.current = view;
    return () => view.destroy();
  }, []);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: [
        languageConf.reconfigure(getLanguage(bodyType)),
      ]
    });
  }, [bodyType]);

  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: themeConf.reconfigure(getEosTheme(fontSize, monoFontFamily)),
    });
  }, [fontSize, monoFontFamily]);

  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: [
        envDecorationsConf.reconfigure(varPlugin),
        autocompleteConf.reconfigure(
          autocompletion({ override: [varCompletion] }),
        ),
      ],
    });
  }, [varPlugin, varCompletion]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const curr = view.state.doc.toString();
    if (value !== curr) {
      view.dispatch({
        changes: { from: 0, to: curr.length, insert: value ?? "" },
      });
    }
  }, [value]);

  return (
    <div ref={containerRef} className={cn("eos-code-editor", className)} />
  );
}

import { useEffect, useRef } from "react";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
} from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { json } from "@codemirror/lang-json";
import { history, historyKeymap } from "@codemirror/commands";
import {
  syntaxHighlighting,
  HighlightStyle,
  bracketMatching,
} from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { autocompletion, closeBrackets } from "@codemirror/autocomplete";
import type { BodyType } from "@/types";

const eosHighlightStyle = HighlightStyle.define([
  { tag: t.propertyName, color: "var(--eos-accent)" },
  { tag: t.string, color: "var(--eos-post)" },
  { tag: t.number, color: "var(--eos-get)" },
  { tag: t.bool, color: "var(--eos-put)" },
  { tag: t.null, color: "var(--eos-options)" },
  { tag: t.keyword, color: "var(--eos-patch)" },
  { tag: t.punctuation, color: "var(--eos-muted)" },
  { tag: t.brace, color: "var(--eos-text)" },
  { tag: t.comment, color: "var(--eos-muted-2)", fontStyle: "italic" },
]);

const eosTheme = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "13px",
    fontFamily: "var(--font-mono)",
    background: "var(--eos-bg)",
    color: "var(--eos-text)",
  },
  ".cm-content": {
    caretColor: "var(--eos-accent) !important",
  },
  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "var(--eos-accent) !important",
    borderLeftWidth: "2px !important",
  },
  ".cm-scroller": { overflow: "auto" },
  ".cm-gutters": {
    background: "var(--eos-bg)",
    border: "none",
    borderRight: "1px solid var(--eos-border)",
    color: "var(--eos-muted-2)",
  },
  ".cm-activeLine": { background: "var(--eos-surface)" },
  ".cm-activeLineGutter": {
    background: "var(--eos-surface)",
    color: "var(--eos-text)",
  },
  "&.cm-focused .cm-selectionBackground, ::selection": {
    background: "var(--eos-accent-dim) !important",
  },
  ".cm-tooltip": {
    background: "var(--eos-surface-2)",
    border: "1px solid var(--eos-border)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
  },
  ".cm-tooltip-autocomplete ul li[aria-selected]": {
    background: "var(--eos-accent)",
    color: "#fff",
  },
});

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  bodyType: BodyType;
}

export function CodeEditor({ value, onChange, bodyType }: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        eosTheme,
        syntaxHighlighting(eosHighlightStyle),
        lineNumbers(),
        highlightActiveLine(),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        history({
          minDepth: 1000,
          newGroupDelay: 500,
        }),
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        EditorView.lineWrapping,
        bodyType === "json" ? json() : [],
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
      ],
    });

    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;

    return () => view.destroy();
  }, [bodyType]);

  useEffect(() => {
    if (viewRef.current) {
      const currentValue = viewRef.current.state.doc.toString();
      if (value !== currentValue) {
        viewRef.current.dispatch({
          changes: { from: 0, to: currentValue.length, insert: value },
        });
      }
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      style={{ flex: 1, height: "100%", overflow: "hidden" }}
    />
  );
}

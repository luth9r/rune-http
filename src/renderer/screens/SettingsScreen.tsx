import React, { useCallback, useEffect } from "react";
import { Folder, Type, Palette } from "lucide-react";
import { useSettingsStore } from "@/features/settings/settings.store";
import { Button } from "../components/ui/button";
import { Select } from "../components/ui/select";
import { NumberInput } from "../components/ui/NumberInput";

export function SettingsScreen() {
  const {
    theme,
    fontSize,
    fontFamily,
    monoFontFamily,
    showScaleIndicator,
    zoomLevel,
    dataStoragePath,
    setTheme,
    setFontSize,
    setFontFamily,
    setMonoFontFamily,
    setShowScaleIndicator,
    setZoomLevel,
    setDataStoragePath,
  } = useSettingsStore();

  const [systemFonts, setSystemFonts] = React.useState<string[]>([]);

  useEffect(() => {
    window.api.utils.getSystemFonts().then((fonts: string[]) => {
      setSystemFonts(fonts);
    });
  }, []);

  const handleSelectDir = useCallback(async () => {
    const path = await window.api.utils.selectDirectory();
    if (path) {
      setDataStoragePath(path);
    }
  }, [setDataStoragePath]);

  const handleResetDir = useCallback(() => {
    setDataStoragePath(null);
  }, [setDataStoragePath]);

  return (
    <div style={s.root}>
      <header style={s.header}>
        <h1 style={s.title}>Settings</h1>
      </header>

      <div style={s.content}>
        {/* Appearance Section */}
        <section style={s.section}>
          <div style={s.sectionHeader}>
            <Type size={18} />
            <h2 style={s.sectionTitle}>Appearance</h2>
          </div>
          
          <div style={s.field}>
            <div style={s.fieldInfo}>
              <label style={s.label}>Font Size</label>
              <span style={s.description}>Global font size for the application.</span>
            </div>
            <NumberInput
              value={fontSize}
              onChange={setFontSize}
              min={8}
              max={24}
              unit="px"
              size="sm"
            />
          </div>

          <div style={s.field}>
            <div style={s.fieldInfo}>
              <label style={s.label}>App Zoom</label>
              <span style={s.description}>Overall interface scale.</span>
            </div>
            <NumberInput
              value={zoomLevel}
              onChange={setZoomLevel}
              min={0.5}
              max={2.0}
              step={0.05}
              unit="x"
              size="sm"
            />
          </div>

          <div style={s.field}>
            <div style={s.fieldInfo}>
              <label style={s.label}>UI Font Family</label>
              <span style={s.description}>System font for labels, buttons, and menus.</span>
            </div>
            <Select
              value={fontFamily}
              onChange={setFontFamily}
              options={[
                { label: "Sans Serif (Inter)", value: "'Inter', sans-serif", style: { fontFamily: "'Inter', sans-serif" } },
                { label: "System Default", value: "system-ui, sans-serif", style: { fontFamily: "system-ui, sans-serif" } },
                ...systemFonts.map(f => ({ 
                  label: f, 
                  value: f,
                  style: { fontFamily: `'${f}', sans-serif` }
                }))
              ]}
            />
          </div>

          <div style={s.field}>
            <div style={s.fieldInfo}>
              <label style={s.label}>Monospace Font Family</label>
              <span style={s.description}>Used for code editors and JSON views.</span>
            </div>
            <Select
              value={monoFontFamily}
              onChange={setMonoFontFamily}
              options={[
                { label: "JetBrains Mono", value: "'JetBrains Mono', monospace", style: { fontFamily: "'JetBrains Mono', monospace" } },
                { label: "Fira Code", value: "'Fira Code', monospace", style: { fontFamily: "'Fira Code', monospace" } },
                { label: "Cascadia Code", value: "'Cascadia Code', monospace", style: { fontFamily: "'Cascadia Code', monospace" } },
                { label: "System Monospace", value: "monospace", style: { fontFamily: "monospace" } },
                ...systemFonts.filter(f => f.toLowerCase().includes('mono')).map(f => ({ 
                  label: f, 
                  value: f,
                  style: { fontFamily: `'${f}', monospace` }
                }))
              ]}
            />
          </div>

          <div style={s.field}>
            <div style={s.fieldInfo}>
              <label style={s.label}>UI Feedback Indicator</label>
              <span style={s.description}>Show zoom level and panel dimensions while adjusting.</span>
            </div>
            <input
              type="checkbox"
              checked={showScaleIndicator}
              onChange={(e) => setShowScaleIndicator(e.target.checked)}
              style={s.checkbox}
            />
          </div>
        </section>

        {/* Theme Section */}
        <section style={s.section}>
          <div style={s.sectionHeader}>
            <Palette size={18} />
            <h2 style={s.sectionTitle}>Theme</h2>
          </div>
          <div style={s.field}>
            <div style={s.fieldInfo}>
              <label style={s.label}>Current Theme</label>
              <span style={s.description}>Switch between available themes.</span>
            </div>
            <Select
              value={theme}
              onChange={(val) => setTheme(val as any)}
              options={[
                { label: "EndeavourOS (Dark)", value: "dark" },
                { label: "Arch Linux", value: "arch" },
                { label: "Light (Coming Soon)", value: "light" },
              ]}
            />
          </div>
        </section>

        {/* Data Section */}
        <section style={s.section}>
          <div style={s.sectionHeader}>
            <Folder size={18} />
            <h2 style={s.sectionTitle}>Data Management</h2>
          </div>
          <div style={s.field}>
            <div style={s.fieldInfo}>
              <label style={s.label}>Storage Location</label>
              <span style={s.description}>Where your collections and request history are saved.</span>
            </div>
            <div style={s.storageControls}>
              <div style={s.pathDisplay}>
                {dataStoragePath || 'Default (App Data)'}
              </div>
              <div style={s.actionButtons}>
                <Button onClick={handleSelectDir} size="sm">Change</Button>
                {dataStoragePath && (
                  <Button onClick={handleResetDir} variant="ghost" size="sm">Reset</Button>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    background: "var(--eos-bg)",
    color: "var(--eos-text)",
    overflow: "hidden",
  },
  header: {
    padding: "24px 32px",
    borderBottom: "1px solid var(--eos-border)",
  },
  title: {
    fontSize: "calc(var(--font-size-base) + 11px)",
    fontWeight: 600,
    margin: 0,
  },
  content: {
    flex: 1,
    padding: "32px",
    overflowY: "auto",
    maxWidth: 800,
    margin: "0 auto",
    width: "100%",
  },
  section: {
    marginBottom: 48,
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
    color: "var(--eos-accent)",
  },
  sectionTitle: {
    fontSize: "calc(var(--font-size-base) + 5px)",
    fontWeight: 600,
    margin: 0,
  },
  field: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid var(--eos-border-2)",
  },
  fieldInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  label: {
    fontSize: "calc(var(--font-size-base) + 1px)",
    fontWeight: 500,
  },
  description: {
    fontSize: "calc(var(--font-size-base) - 2px)",
    color: "var(--eos-muted)",
  },
  storageControls: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 8,
  },
  pathDisplay: {
    fontSize: "calc(var(--font-size-base) - 1px)",
    fontFamily: "var(--font-mono)",
    background: "var(--eos-surface-2)",
    padding: "6px 10px",
    borderRadius: 4,
    maxWidth: 400,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  actionButtons: {
    display: "flex",
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    accentColor: "var(--eos-accent)",
    cursor: "pointer",
  },
};

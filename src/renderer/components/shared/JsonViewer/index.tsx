import ReactJson from 'react-json-view'
import './json-viewer.css'

const eosJsonTheme = {
  base00: 'transparent',
  base01: 'var(--eos-surface-2)',
  base02: 'var(--eos-border)',
  base03: 'var(--eos-muted)',
  base04: 'var(--eos-muted-2)',
  base05: 'var(--eos-text)',
  base06: 'var(--eos-text)',
  base07: 'var(--eos-accent)',
  base08: 'var(--eos-delete)',
  base09: 'var(--eos-get)',
  base0A: 'var(--eos-put)',
  base0B: 'var(--eos-post)',
  base0C: 'var(--eos-head)',
  base0D: 'var(--eos-accent-h)',
  base0E: 'var(--eos-patch)',
  base0F: 'var(--eos-options)',
}

interface JsonViewerProps {
  src: object
  collapsed?: number
}

export function JsonViewer({ src, collapsed = 2 }: JsonViewerProps) {
  return (
    <div className="json-viewer-wrapper">
      <ReactJson
        collapsed={collapsed}
        displayDataTypes={false}
        displayObjectSize={true}
        enableClipboard={false}
        iconStyle="triangle"
        name={null}
        src={src}
        theme={eosJsonTheme}
      />
    </div>
  )
}

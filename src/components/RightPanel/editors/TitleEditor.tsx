import { useResumeStore } from '@/store/useResumeStore'
import type { TitleBlock } from '@/store/types'

export function TitleEditor({ block }: { block: TitleBlock }) {
  const updateBlock = useResumeStore(s => s.updateBlock)

  return (
    <div className="p-4 space-y-4">
      <EditableField label="内容">
        <input
          value={block.content}
          onChange={e => updateBlock(block.id, { content: e.target.value } as any)}
          className="w-full text-xs px-2.5 py-1.5 rounded border border-[var(--border-color)] bg-white text-[var(--editor-text)] outline-none focus:border-[var(--accent)]"
        />
      </EditableField>

      <EditableField label="级别">
        <select
          value={block.level}
          onChange={e => updateBlock(block.id, { level: e.target.value } as any)}
          className="w-full text-xs px-2.5 py-1.5 rounded border border-[var(--border-color)] bg-white text-[var(--editor-text)] outline-none"
        >
          <option value="h1">H1 大标题</option>
          <option value="h2">H2 中标题</option>
          <option value="h3">H3 小标题</option>
        </select>
      </EditableField>

      <EditableField label="样式">
        <div className="flex items-center gap-3 flex-wrap">
          <StyleToggle active={block.style.bold} onChange={v => updateBlock(block.id, { style: { ...block.style, bold: v } } as any)}>B</StyleToggle>
          <StyleToggle active={block.style.italic} onChange={v => updateBlock(block.id, { style: { ...block.style, italic: v } } as any)} italic>I</StyleToggle>
          <StyleToggle active={block.style.underline} onChange={v => updateBlock(block.id, { style: { ...block.style, underline: v } } as any)} underline>U</StyleToggle>
        </div>
      </EditableField>

      <EditableField label="文字颜色">
        <ColorInput value={block.style.color} onChange={v => updateBlock(block.id, { style: { ...block.style, color: v } } as any)} />
      </EditableField>

      <EditableField label="字号">
        <SliderInput value={block.style.fontSize} min={12} max={48} onChange={v => updateBlock(block.id, { style: { ...block.style, fontSize: v } } as any)} />
      </EditableField>
    </div>
  )
}

// ====== Shared editor components ======

function EditableField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium">{label}</label>
      {children}
    </div>
  )
}

function StyleToggle({ active, onChange, italic, underline, children }: { active: boolean; onChange: (v: boolean) => void; italic?: boolean; underline?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={() => onChange(!active)}
      className={`w-8 h-8 rounded-md text-xs font-bold border transition-colors ${
        active ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'bg-white border-[var(--border-color)] text-[var(--editor-text)]'
      } ${italic ? 'italic' : ''} ${underline ? 'underline' : ''}`}
    >
      {children}
    </button>
  )
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const presets = ['#1a1a1a', '#2563eb', '#059669', '#dc2626', '#7c3aed', '#ea580c', '#ca8a04', '#64748b']
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-7 h-7 rounded cursor-pointer border border-[var(--border-color)] p-0"
      />
      {presets.map(c => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className="w-5 h-5 rounded-full border-2 transition-colors"
          style={{ backgroundColor: c, borderColor: value === c ? 'var(--accent)' : 'transparent' }}
        />
      ))}
    </div>
  )
}

function SliderInput({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 accent-[var(--accent)] h-1"
      />
      <span className="text-[11px] text-neutral-500 w-8 text-right">{value}px</span>
    </div>
  )
}

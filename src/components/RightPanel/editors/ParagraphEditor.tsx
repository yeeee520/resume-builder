import { useResumeStore } from '@/store/useResumeStore'
import type { ParagraphBlock } from '@/store/types'

export function ParagraphEditor({ block }: { block: ParagraphBlock }) {
  const updateBlock = useResumeStore(s => s.updateBlock)

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1">
        <label className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium">内容</label>
        <textarea
          value={block.content}
          onChange={e => updateBlock(block.id, { content: e.target.value } as any)}
          rows={6}
          className="w-full text-xs px-2.5 py-2 rounded border border-[var(--border-color)] bg-white text-[var(--editor-text)] outline-none focus:border-[var(--accent)] resize-y"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium">文字颜色</label>
        <ColorInput value={block.style.color} onChange={v => updateBlock(block.id, { style: { ...block.style, color: v } } as any)} />
      </div>

      <div className="space-y-1">
        <label className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium">字号</label>
        <SliderInput value={block.style.fontSize} min={10} max={32} onChange={v => updateBlock(block.id, { style: { ...block.style, fontSize: v } } as any)} />
      </div>

      <div className="space-y-1">
        <label className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium">行高</label>
        <SliderInput value={block.style.lineHeight * 10} min={10} max={25} onChange={v => updateBlock(block.id, { style: { ...block.style, lineHeight: v / 10 } } as any)} />
      </div>
    </div>
  )
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const presets = ['#1a1a1a', '#374151', '#4b5563', '#6b7280', '#2563eb', '#059669', '#dc2626']
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-7 h-7 rounded cursor-pointer border border-[var(--border-color)] p-0" />
      {presets.map(c => (
        <button key={c} onClick={() => onChange(c)} className="w-5 h-5 rounded-full border-2 transition-colors"
          style={{ backgroundColor: c, borderColor: value === c ? 'var(--accent)' : 'transparent' }} />
      ))}
    </div>
  )
}

function SliderInput({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} className="flex-1 accent-[var(--accent)] h-1" />
      <span className="text-[11px] text-neutral-500 w-8 text-right">{value}</span>
    </div>
  )
}

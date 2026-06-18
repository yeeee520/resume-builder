import { useResumeStore } from '@/store/useResumeStore'
import type { DividerBlock } from '@/store/types'

export function DividerEditor({ block }: { block: DividerBlock }) {
  const updateBlock = useResumeStore(s => s.updateBlock)
  const s = block.style

  return (
    <div className="p-4 space-y-4">
      <Field label="粗细">
        <SliderInput value={s.thickness} min={1} max={8} onChange={v => updateBlock(block.id, { style: { ...s, thickness: v } } as any)} />
      </Field>
      <Field label="颜色">
        <ColorInput value={s.color} onChange={v => updateBlock(block.id, { style: { ...s, color: v } } as any)} />
      </Field>
      <Field label="样式">
        <button onClick={() => updateBlock(block.id, { style: { ...s, dash: !s.dash } } as any)}
          className={`text-xs px-3 py-1.5 rounded border transition-colors ${s.dash ? 'bg-[var(--accent)] text-white' : 'bg-white border-[var(--border-color)]'}`}>
          {s.dash ? '虚线' : '实线'}
        </button>
      </Field>
      <Field label="上方间距">
        <SliderInput value={s.marginTop} min={0} max={40} onChange={v => updateBlock(block.id, { style: { ...s, marginTop: v } } as any)} />
      </Field>
      <Field label="下方间距">
        <SliderInput value={s.marginBottom} min={0} max={40} onChange={v => updateBlock(block.id, { style: { ...s, marginBottom: v } } as any)} />
      </Field>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1">
    <label className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium">{label}</label>
    {children}
  </div>
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const presets = ['#d1d5db', '#9ca3af', '#6b7280', '#1a1a1a', '#2563eb', '#059669']
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-7 h-7 rounded cursor-pointer border border-[var(--border-color)] p-0" />
      {presets.map(c => <button key={c} onClick={() => onChange(c)} className="w-5 h-5 rounded-full border-2 transition-colors"
        style={{ backgroundColor: c, borderColor: value === c ? 'var(--accent)' : 'transparent' }} />)}
    </div>
  )
}

function SliderInput({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} className="flex-1 accent-[var(--accent)] h-1" />
      <span className="text-[11px] text-neutral-500 w-8 text-right">{value}px</span>
    </div>
  )
}

import { useResumeStore } from '@/store/useResumeStore'
import type { SkillBarBlock } from '@/store/types'

export function SkillBarEditor({ block }: { block: SkillBarBlock }) {
  const updateBlock = useResumeStore(s => s.updateBlock)
  const s = block.style

  return (
    <div className="p-4 space-y-4">
      <Field label="技能名称">
        <input value={block.label} onChange={e => updateBlock(block.id, { label: e.target.value } as any)}
          className="w-full text-xs px-2.5 py-1.5 rounded border border-[var(--border-color)] bg-white outline-none focus:border-[var(--accent)]" />
      </Field>
      <Field label="掌握程度">
        <div className="flex items-center gap-3">
          <input type="range" min={0} max={100} value={block.level} onChange={e => updateBlock(block.id, { level: Number(e.target.value) } as any)}
            className="flex-1 accent-[var(--accent)] h-1" />
          <span className="text-xs font-medium w-10 text-right">{block.level}%</span>
        </div>
      </Field>
      <Field label="文字颜色"><ColorInput value={s.color} onChange={v => updateBlock(block.id, { style: { ...s, color: v } } as any)} /></Field>
      <Field label="进度条颜色"><ColorInput value={s.barColor} onChange={v => updateBlock(block.id, { style: { ...s, barColor: v } } as any)} /></Field>
      <Field label="背景色"><ColorInput value={s.bgColor} onChange={v => updateBlock(block.id, { style: { ...s, bgColor: v } } as any)} /></Field>
      <Field label="字号">
        <RangeWithLabel value={s.fontSize} min={10} max={24} onChange={v => updateBlock(block.id, { style: { ...s, fontSize: v } } as any)} />
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
  const presets = ['#2563eb', '#059669', '#7c3aed', '#dc2626', '#ea580c', '#1a1a1a', '#94a3b8']
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-7 h-7 rounded cursor-pointer border p-0" />
      {presets.map(c => <button key={c} onClick={() => onChange(c)} className="w-5 h-5 rounded-full border-2"
        style={{ backgroundColor: c, borderColor: value === c ? 'var(--accent)' : 'transparent' }} />)}
    </div>
  )
}

function RangeWithLabel({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} className="flex-1 accent-[var(--accent)] h-1" />
      <span className="text-[11px] text-neutral-500 w-8 text-right">{value}px</span>
    </div>
  )
}

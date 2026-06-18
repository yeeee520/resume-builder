import { useResumeStore } from '@/store/useResumeStore'
import type { ContactBlock } from '@/store/types'
import { nanoid } from 'nanoid'

export function ContactEditor({ block }: { block: ContactBlock }) {
  const updateBlock = useResumeStore(s => s.updateBlock)
  const s = block.style

  function addItem() {
    const newItem = { id: nanoid(8), label: '标签', value: '内容' }
    updateBlock(block.id, { items: [...block.items, newItem] } as any)
  }

  function updateItem(id: string, field: string, value: string) {
    updateBlock(block.id, { items: block.items.map(i => i.id === id ? { ...i, [field]: value } : i) } as any)
  }

  function removeItem(id: string) {
    updateBlock(block.id, { items: block.items.filter(i => i.id !== id) } as any)
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1">
        <label className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium">联系方式 ({block.items.length})</label>
        {block.items.map(item => (
          <div key={item.id} className="flex items-center gap-2">
            <input value={item.label} onChange={e => updateItem(item.id, 'label', e.target.value)}
              placeholder="标签"
              className="w-16 text-xs px-2 py-1 rounded border border-[var(--border-color)] bg-white outline-none focus:border-[var(--accent)]" />
            <input value={item.value} onChange={e => updateItem(item.id, 'value', e.target.value)}
              placeholder="内容"
              className="flex-1 text-xs px-2 py-1 rounded border border-[var(--border-color)] bg-white outline-none focus:border-[var(--accent)]" />
            <button onClick={() => removeItem(item.id)} className="text-[11px] px-1 text-red-400 hover:bg-red-50 rounded">✕</button>
          </div>
        ))}
        <button onClick={addItem} className="w-full text-xs py-1.5 rounded border border-dashed border-[var(--border-color)] text-neutral-400 hover:text-neutral-600 hover:bg-[var(--surface-hover)] transition-colors">
          + 添加
        </button>
      </div>

      <div className="space-y-1">
        <label className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium">布局</label>
        <div className="flex gap-2">
          <button onClick={() => updateBlock(block.id, { style: { ...s, layout: 'horizontal' } } as any)}
            className={`text-xs px-3 py-1.5 rounded border transition-colors ${s.layout === 'horizontal' ? 'bg-[var(--accent)] text-white' : 'bg-white'}`}>水平</button>
          <button onClick={() => updateBlock(block.id, { style: { ...s, layout: 'vertical' } } as any)}
            className={`text-xs px-3 py-1.5 rounded border transition-colors ${s.layout === 'vertical' ? 'bg-[var(--accent)] text-white' : 'bg-white'}`}>垂直</button>
        </div>
      </div>

      <div className="space-y-1"><label className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium">文字颜色</label>
        <ColorInput value={s.color} onChange={v => updateBlock(block.id, { style: { ...s, color: v } } as any)} /></div>
      <div className="space-y-1"><label className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium">字号</label>
        <RangeWithLabel value={s.fontSize} min={10} max={24} onChange={v => updateBlock(block.id, { style: { ...s, fontSize: v } } as any)} /></div>
    </div>
  )
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const presets = ['#1a1a1a', '#374151', '#6b7280', '#2563eb', '#059669', '#dc2626']
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

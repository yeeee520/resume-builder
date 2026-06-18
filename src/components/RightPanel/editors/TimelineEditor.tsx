import { useResumeStore } from '@/store/useResumeStore'
import type { TimelineBlock } from '@/store/types'
import { nanoid } from 'nanoid'

export function TimelineEditor({ block }: { block: TimelineBlock }) {
  const updateBlock = useResumeStore(s => s.updateBlock)
  const s = block.style

  function addItem() {
    const newItem = { id: nanoid(8), dateRange: '2020.01 - 至今', title: '新经历', description: '' }
    updateBlock(block.id, { items: [...block.items, newItem] } as any)
  }

  function updateItem(id: string, field: string, value: string) {
    updateBlock(block.id, { items: block.items.map(i => i.id === id ? { ...i, [field]: value } : i) } as any)
  }

  function removeItem(id: string) {
    updateBlock(block.id, { items: block.items.filter(i => i.id !== id) } as any)
  }

  function moveItem(from: number, to: number) {
    const items = [...block.items]
    const [item] = items.splice(from, 1)
    items.splice(to, 0, item)
    updateBlock(block.id, { items } as any)
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1">
        <label className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium">条目 ({block.items.length})</label>
        {block.items.map((item, i) => (
          <div key={item.id} className="border border-[var(--border-color)] rounded-lg p-3 space-y-2 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-neutral-400 font-medium">#{i + 1}</span>
              <div className="flex gap-1">
                {i > 0 && <button onClick={() => moveItem(i, i - 1)} className="text-[11px] px-1 rounded hover:bg-neutral-100">↑</button>}
                {i < block.items.length - 1 && <button onClick={() => moveItem(i, i + 1)} className="text-[11px] px-1 rounded hover:bg-neutral-100">↓</button>}
                <button onClick={() => removeItem(item.id)} className="text-[11px] px-1 rounded text-red-400 hover:bg-red-50">✕</button>
              </div>
            </div>
            <input value={item.dateRange} onChange={e => updateItem(item.id, 'dateRange', e.target.value)}
              placeholder="日期范围"
              className="w-full text-xs px-2 py-1 rounded border border-[var(--border-color)] bg-white outline-none focus:border-[var(--accent)]" />
            <input value={item.title} onChange={e => updateItem(item.id, 'title', e.target.value)}
              placeholder="标题"
              className="w-full text-xs px-2 py-1 rounded border border-[var(--border-color)] bg-white outline-none focus:border-[var(--accent)]" />
            <textarea value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)}
              placeholder="描述"
              rows={2}
              className="w-full text-xs px-2 py-1 rounded border border-[var(--border-color)] bg-white outline-none focus:border-[var(--accent)] resize-y" />
          </div>
        ))}
        <button onClick={addItem} className="w-full text-xs py-1.5 rounded border border-dashed border-[var(--border-color)] text-neutral-400 hover:text-neutral-600 hover:bg-[var(--surface-hover)] transition-colors">
          + 添加条目
        </button>
      </div>

      <div className="space-y-1">
        <label className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium">文字颜色</label>
        <ColorInput value={s.color} onChange={v => updateBlock(block.id, { style: { ...s, color: v } } as any)} />
      </div>
      <div className="space-y-1">
        <label className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium">时间线颜色</label>
        <ColorInput value={s.lineColor} onChange={v => updateBlock(block.id, { style: { ...s, lineColor: v } } as any)} />
      </div>
      <div className="space-y-1">
        <label className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium">字号</label>
        <RangeWithLabel value={s.fontSize} min={10} max={24} onChange={v => updateBlock(block.id, { style: { ...s, fontSize: v } } as any)} />
      </div>
    </div>
  )
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const presets = ['#1a1a1a', '#374151', '#2563eb', '#059669', '#7c3aed', '#dc2626']
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

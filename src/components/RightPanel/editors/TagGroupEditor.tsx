import { useResumeStore } from '@/store/useResumeStore'
import type { TagGroupBlock } from '@/store/types'
import { nanoid } from 'nanoid'

export function TagGroupEditor({ block }: { block: TagGroupBlock }) {
  const updateBlock = useResumeStore(s => s.updateBlock)

  function addTag() {
    const newTag = { id: nanoid(8), text: '新标签', color: '#2563eb' }
    updateBlock(block.id, { tags: [...block.tags, newTag] } as any)
  }

  function updateTag(id: string, field: string, value: string) {
    updateBlock(block.id, { tags: block.tags.map(t => t.id === id ? { ...t, [field]: value } : t) } as any)
  }

  function removeTag(id: string) {
    updateBlock(block.id, { tags: block.tags.filter(t => t.id !== id) } as any)
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1">
        <label className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium">标签 ({block.tags.length})</label>
        {block.tags.map(tag => (
          <div key={tag.id} className="flex items-center gap-2">
            <input type="color" value={tag.color} onChange={e => updateTag(tag.id, 'color', e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border p-0 shrink-0" />
            <input value={tag.text} onChange={e => updateTag(tag.id, 'text', e.target.value)}
              className="flex-1 text-xs px-2 py-1 rounded border border-[var(--border-color)] bg-white outline-none focus:border-[var(--accent)]" />
            <button onClick={() => removeTag(tag.id)} className="text-[11px] px-1 text-red-400 hover:bg-red-50 rounded">✕</button>
          </div>
        ))}
        <button onClick={addTag} className="w-full text-xs py-1.5 rounded border border-dashed border-[var(--border-color)] text-neutral-400 hover:text-neutral-600 hover:bg-[var(--surface-hover)] transition-colors">
          + 添加标签
        </button>
      </div>
    </div>
  )
}

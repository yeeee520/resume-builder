import { useState } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { LIBRARY_ITEMS } from './ComponentLibrary'
import { DraggableBlockItem } from './DraggableBlockItem'
import { ImportSection } from './ImportSection'
import { useResumeStore } from '@/store/useResumeStore'

export function LeftPanel() {
  const [search, setSearch] = useState('')
  const toggleLeftPanel = useEditorStore(s => s.toggleLeftPanel)
  const addBlock = useResumeStore(s => s.addBlock)
  const selectBlock = useEditorStore(s => s.selectBlock)

  const filtered = LIBRARY_ITEMS.filter(
    item =>
      item.name.includes(search) ||
      item.description.includes(search) ||
      item.type.includes(search)
  )

  function handleClickAdd(type: (typeof LIBRARY_ITEMS)[number]['type']) {
    const id = addBlock(type)
    selectBlock(id)
  }

  return (
    <aside className="w-[260px] border-r border-[var(--border-color)] bg-[var(--panel-bg)] flex flex-col shrink-0 transition-all duration-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--editor-text)]">🧩 组件库</h2>
        <button
          onClick={toggleLeftPanel}
          className="text-[11px] text-neutral-400 hover:text-neutral-600 px-1.5 py-0.5 rounded transition-colors"
          title="Ctrl+B 折叠"
        >
          折叠
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜索组件..."
          className="w-full text-xs px-2.5 py-1.5 rounded-md border border-[var(--border-color)] bg-[var(--editor-bg)] text-[var(--editor-text)] placeholder:text-neutral-400 outline-none focus:border-[var(--accent)] transition-colors"
        />
      </div>

      {/* 组件列表 */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {filtered.length === 0 && (
          <p className="text-xs text-neutral-400 text-center py-8">无匹配组件</p>
        )}
        {filtered.map(item => (
          <DraggableBlockItem
            key={item.type}
            item={item}
            onClick={() => handleClickAdd(item.type)}
          />
        ))}
      </div>

      {/* 导入区 */}
      <ImportSection />
    </aside>
  )
}

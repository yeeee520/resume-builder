import { useEditorStore } from '@/store/useEditorStore'
import { useResumeStore } from '@/store/useResumeStore'
import { TitleEditor } from './editors/TitleEditor'
import { ParagraphEditor } from './editors/ParagraphEditor'
import { DividerEditor } from './editors/DividerEditor'
import { SkillBarEditor } from './editors/SkillBarEditor'
import { TimelineEditor } from './editors/TimelineEditor'
import { AvatarEditor } from './editors/AvatarEditor'
import { TagGroupEditor } from './editors/TagGroupEditor'
import { ContactEditor } from './editors/ContactEditor'
import { SpacerEditor } from './editors/SpacerEditor'
import { getLibraryItem } from '@/components/LeftPanel/ComponentLibrary'

export function RightPanel() {
  const selectedBlockId = useEditorStore(s => s.selectedBlockId)
  const toggleRightPanel = useEditorStore(s => s.toggleRightPanel)
  const block = useResumeStore(s => {
    const resume = s.resumes.find(r => r.id === s.currentResumeId)
    return resume?.blocks.find(b => b.id === selectedBlockId) ?? null
  })
  const removeBlock = useResumeStore(s => s.removeBlock)
  const duplicateBlock = useResumeStore(s => s.duplicateBlock)
  const updateBlock = useResumeStore(s => s.updateBlock)
  const selectBlock = useEditorStore(s => s.selectBlock)

  function handleDuplicate() {
    if (!block) return
    const newId = duplicateBlock(block.id)
    if (newId) selectBlock(newId)
  }

  function handleDelete() {
    if (!block) return
    removeBlock(block.id)
    selectBlock(null)
  }

  const libItem = block ? getLibraryItem(block.type) : null

  return (
    <aside className="w-[300px] border-l border-[var(--border-color)] bg-[var(--panel-bg)] flex flex-col shrink-0 transition-all duration-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--editor-text)]">
          ✏️ {block ? `${libItem?.icon} ${libItem?.name} 编辑` : '属性编辑'}
        </h2>
        <button
          onClick={toggleRightPanel}
          className="text-[11px] text-neutral-400 hover:text-neutral-600 px-1.5 py-0.5 rounded transition-colors"
        >
          折叠
        </button>
      </div>

      {/* Editor or empty */}
      <div className="flex-1 overflow-y-auto">
        {!block && (
          <div className="flex items-center justify-center py-16 text-sm text-neutral-400 px-6 text-center">
            点击画布中的拼图块<br />进行内容和样式编辑
          </div>
        )}

        {/* v2: 自由布局位置与尺寸编辑 */}
        {block && (
          <div className="p-3 border-b border-[var(--border-color)] bg-neutral-50/50 space-y-2">
            <p className="text-[11px] text-neutral-500 uppercase tracking-wider font-medium">📐 位置与尺寸</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-neutral-400">X</label>
                <input type="number" value={Math.round(block.x || 0)}
                  onChange={e => updateBlock(block.id, { x: Number(e.target.value) } as any)}
                  className="w-full text-[11px] px-2 py-1 rounded border border-[var(--border-color)] bg-white" />
              </div>
              <div>
                <label className="text-[10px] text-neutral-400">Y</label>
                <input type="number" value={Math.round(block.y || 0)}
                  onChange={e => updateBlock(block.id, { y: Number(e.target.value) } as any)}
                  className="w-full text-[11px] px-2 py-1 rounded border border-[var(--border-color)] bg-white" />
              </div>
              <div>
                <label className="text-[10px] text-neutral-400">宽 (0=auto)</label>
                <input type="number" value={Math.round(block.width || 0)}
                  onChange={e => updateBlock(block.id, { width: Number(e.target.value) } as any)}
                  className="w-full text-[11px] px-2 py-1 rounded border border-[var(--border-color)] bg-white" />
              </div>
              <div>
                <label className="text-[10px] text-neutral-400">高 (0=auto)</label>
                <input type="number" value={Math.round(block.height || 0)}
                  onChange={e => updateBlock(block.id, { height: Number(e.target.value) } as any)}
                  className="w-full text-[11px] px-2 py-1 rounded border border-[var(--border-color)] bg-white" />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-neutral-400">层级</label>
              <input type="number" value={block.zIndex || 0}
                onChange={e => updateBlock(block.id, { zIndex: Number(e.target.value) } as any)}
                className="w-full text-[11px] px-2 py-1 rounded border border-[var(--border-color)] bg-white" />
            </div>
          </div>
        )}

        {block?.type === 'title' && <TitleEditor block={block} />}
        {block?.type === 'paragraph' && <ParagraphEditor block={block} />}
        {block?.type === 'divider' && <DividerEditor block={block} />}
        {block?.type === 'skill-bar' && <SkillBarEditor block={block} />}
        {block?.type === 'timeline' && <TimelineEditor block={block} />}
        {block?.type === 'avatar' && <AvatarEditor block={block} />}
        {block?.type === 'tag-group' && <TagGroupEditor block={block} />}
        {block?.type === 'contact' && <ContactEditor block={block} />}
        {block?.type === 'spacer' && <SpacerEditor block={block} />}
      </div>

      {/* Footer actions */}
      {block && (
        <div className="border-t border-[var(--border-color)] px-4 py-2.5 flex gap-2">
          <button
            onClick={handleDuplicate}
            className="flex-1 text-[11px] py-1.5 rounded border border-[var(--border-color)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            📋 复制块
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 text-[11px] py-1.5 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
          >
            🗑️ 删除块
          </button>
        </div>
      )}
    </aside>
  )
}

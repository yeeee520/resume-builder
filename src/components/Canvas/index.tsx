import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useResumeStore } from '@/store/useResumeStore'
import { useEditorStore } from '@/store/useEditorStore'
import { LIBRARY_ITEMS } from '@/components/LeftPanel/ComponentLibrary'
import type { Block, BlockType } from '@/store/types'

// ==================== SortableBlock ====================

function SortableBlock({ block }: { block: Block }) {
  const selectedBlockId = useEditorStore(s => s.selectedBlockId)
  const selectBlock = useEditorStore(s => s.selectBlock)
  const isSelected = selectedBlockId === block.id

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative transition-all duration-150 cursor-grab active:cursor-grabbing rounded-sm border-2 mb-1 ${
        isSelected
          ? 'border-[var(--accent)] shadow-sm'
          : 'border-transparent hover:border-neutral-200'
      }`}
      onClick={(e) => {
        e.stopPropagation()
        selectBlock(block.id)
      }}
    >
      <div className="p-3">
        <BlockDisplay block={block} />
      </div>
    </div>
  )
}

// ==================== BlockDisplay ====================

function BlockDisplay({ block }: { block: Block }) {
  switch (block.type) {
    case 'title': {
      const Tag = block.level === 'h1' ? 'h1' : block.level === 'h3' ? 'h3' : 'h2'
      return (
        <Tag style={{
          color: block.style.color, fontSize: block.style.fontSize,
          fontWeight: block.style.bold ? 700 : 400,
          fontStyle: block.style.italic ? 'italic' : 'normal',
          textDecoration: block.style.underline ? 'underline' : 'none',
          margin: 0,
        }}>{block.content || '新标题'}</Tag>
      )
    }
    case 'paragraph':
      return (
        <p className="whitespace-pre-wrap" style={{
          color: block.style.color, fontSize: block.style.fontSize,
          lineHeight: block.style.lineHeight, margin: 0,
        }}>{block.content || '正文内容'}</p>
      )
    case 'divider':
      return (
        <hr style={{
          borderTop: `${block.style.thickness}px ${block.style.dash ? 'dashed' : 'solid'} ${block.style.color}`,
          marginTop: block.style.marginTop, marginBottom: block.style.marginBottom,
          borderBottom: 'none', borderLeft: 'none', borderRight: 'none',
        }} />
      )
    case 'skill-bar':
      return (
        <div className="flex items-center gap-3">
          <span className="shrink-0" style={{ color: block.style.color, fontSize: block.style.fontSize, minWidth: 80 }}>{block.label}</span>
          <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: block.style.bgColor }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${block.level}%`, backgroundColor: block.style.barColor }} />
          </div>
          <span className="shrink-0 text-xs" style={{ color: block.style.color, fontSize: block.style.fontSize }}>{block.level}%</span>
        </div>
      )
    case 'timeline':
      return (
        <div style={{ color: block.style.color, fontSize: block.style.fontSize }}>
          {block.items.map((item, i) => (
            <div key={item.id} className="flex gap-3 mb-3 last:mb-0">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-2.5 h-2.5 rounded-full mt-1" style={{ backgroundColor: block.style.lineColor }} />
                {i < block.items.length - 1 && <div className="w-px flex-1 min-h-[20px]" style={{ backgroundColor: block.style.lineColor }} />}
              </div>
              <div className="pb-1">
                <div className="text-xs opacity-55 mb-0.5">{item.dateRange}</div>
                <div className="font-semibold">{item.title}</div>
                {item.description && <div className="opacity-75 mt-1 text-sm whitespace-pre-wrap">{item.description}</div>}
              </div>
            </div>
          ))}
        </div>
      )
    case 'avatar': {
      const sizeStyle = { width: block.size, height: block.size }
      const br = block.shape === 'circle' ? '50%' : '12px'
      return !block.imageDataUrl
        ? <div className="bg-neutral-100 flex items-center justify-center border-2 border-dashed border-neutral-200" style={{ ...sizeStyle, borderRadius: br }}><span className="text-3xl opacity-30">📷</span></div>
        : <img src={block.imageDataUrl} alt="头像" style={{ ...sizeStyle, borderRadius: br, objectFit: 'cover' }} />
    }
    case 'tag-group':
      return (
        <div className="flex flex-wrap gap-1.5">
          {block.tags.map(tag => (
            <span key={tag.id} className="px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: tag.color + '18', color: tag.color, border: `1px solid ${tag.color}33` }}>
              {tag.text}
            </span>
          ))}
        </div>
      )
    case 'contact':
      return (
        <div className={block.style.layout === 'horizontal' ? 'flex flex-wrap gap-x-4 gap-y-1.5' : 'flex flex-col gap-1'} style={{ fontSize: block.style.fontSize, color: block.style.color }}>
          {block.items.map(item => (
            <div key={item.id} className="flex items-center gap-1.5">
              <span className="font-semibold opacity-60 text-xs">{item.label}</span>
              <span>{item.value}</span>
            </div>
          ))}
        </div>
      )
    case 'spacer':
      return <div style={{ height: block.height, width: '100%' }} className="bg-transparent" />
  }
}

// ==================== Canvas ====================

export function Canvas() {
  const resumes = useResumeStore(s => s.resumes)
  const currentResumeId = useResumeStore(s => s.currentResumeId)
  const addBlock = useResumeStore(s => s.addBlock)
  const moveBlock = useResumeStore(s => s.moveBlock)
  const selectBlock = useEditorStore(s => s.selectBlock)
  const setDragging = useEditorStore(s => s.setDragging)

  const resume = resumes.find(r => r.id === currentResumeId)
  const blocks = resume?.blocks ?? []

  const [activeDragType, setActiveDragType] = useState<BlockType | null>(null)
  const [activeBlock, setActiveBlock] = useState<Block | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function handleDragStart(e: DragStartEvent) {
    setDragging(true)
    if (e.active.data.current?.type === 'library') {
      setActiveDragType(e.active.data.current.blockType)
    } else {
      const block = blocks.find(b => b.id === e.active.id)
      if (block) setActiveBlock(block)
    }
  }

  function handleDragEnd(e: DragEndEvent) {
    setDragging(false)
    setActiveDragType(null)
    setActiveBlock(null)

    const { active, over } = e
    if (active.data.current?.type === 'library') {
      const blockType = active.data.current.blockType as BlockType
      if (!over) { addBlock(blockType) }
      else { const overIdx = blocks.findIndex(b => b.id === over.id); addBlock(blockType, overIdx >= 0 ? overIdx : blocks.length) }
      return
    }

    if (!over || active.id === over.id) return
    const fromIdx = blocks.findIndex(b => b.id === active.id)
    const toIdx = blocks.findIndex(b => b.id === over.id)
    if (fromIdx >= 0 && toIdx >= 0) moveBlock(fromIdx, toIdx)
  }

  if (!resume) return null

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <main className="flex-1 flex items-center justify-center p-4 bg-[var(--editor-bg)] overflow-hidden" onClick={() => selectBlock(null)}>
        <div id="resume-canvas" className="bg-[var(--canvas-bg)] text-[var(--canvas-text)] shadow-[var(--shadow-lg)] rounded-sm transition-colors duration-200"
          style={{
            width: 794,
            maxWidth: '100%',
            maxHeight: '100%',
            aspectRatio: '210 / 297',
          }}>
          <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col p-6 h-full overflow-y-auto" style={{ fontSize: 'inherit' }}>
              {blocks.map(block => <SortableBlock key={block.id} block={block} />)}
              {blocks.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-neutral-300">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📄</div>
                    <p className="text-lg text-neutral-400">从左侧拖入拼图块开始制作简历</p>
                    <p className="text-sm mt-2 text-neutral-300">或点击"导入 PDF/Word"从现有简历提取内容</p>
                  </div>
                </div>
              )}
            </div>
          </SortableContext>
        </div>
      </main>

      <DragOverlay>
        {activeDragType && (
          <div className="px-3 py-2 rounded bg-white shadow-lg border border-[var(--accent)] text-xs opacity-80">
            {LIBRARY_ITEMS.find(i => i.type === activeDragType)?.icon} {LIBRARY_ITEMS.find(i => i.type === activeDragType)?.name}
          </div>
        )}
        {activeBlock && (
          <div className="scale-95 opacity-90 shadow-lg">
            <SortableBlock block={activeBlock} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

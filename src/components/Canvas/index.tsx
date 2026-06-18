import { useState, useRef, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useResumeStore } from '@/store/useResumeStore'
import { useEditorStore } from '@/store/useEditorStore'
import { LIBRARY_ITEMS } from '@/components/LeftPanel/ComponentLibrary'
import type { Block, BlockType } from '@/store/types'

// ==================== FreeBlock ====================

function FreeBlock({ block }: { block: Block }) {
  const selectedBlockId = useEditorStore(s => s.selectedBlockId)
  const selectBlock = useEditorStore(s => s.selectBlock)
  const updateBlock = useResumeStore(s => s.updateBlock)
  const isSelected = selectedBlockId === block.id

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: block.id,
  })

  // 保留flow模式兼容
  const isFree = true

  const style: React.CSSProperties = isFree
    ? {
        position: 'absolute',
        left: block.x,
        top: block.y,
        width: block.width > 0 ? block.width : undefined,
        height: block.height > 0 ? block.height : undefined,
        minWidth: 40,
        minHeight: 20,
        zIndex: isDragging ? 100 : (block.zIndex || 1),
        boxShadow: isSelected ? 'var(--shadow-sm)' : undefined,
      }
    : {
        zIndex: isDragging ? 50 : undefined,
        boxShadow: isSelected ? 'var(--shadow-sm)' : undefined,
      }

  if (transform && isFree) {
    style.transform = `translate3d(${transform.x}px, ${transform.y}px, 0)`
    style.opacity = isDragging ? 0.5 : 1
  }

  // Resize 相关
  const [resizing, setResizing] = useState<string | null>(null)

  function handleResizeStart(e: React.MouseEvent, dir: string) {
    e.stopPropagation()
    e.preventDefault()

    const startX = e.clientX
    const startY = e.clientY
    const startW = block.width > 0 ? block.width : 200
    const startH = block.height > 0 ? block.height : 60
    const startLeft = block.x
    const startTop = block.y

    setResizing(dir)

    function onMove(ev: MouseEvent) {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY

      let newW = startW, newH = startH, newX = startLeft, newY = startTop

      if (dir.includes('e')) newW = Math.max(40, startW + dx)
      if (dir.includes('s')) newH = Math.max(20, startH + dy)
      if (dir.includes('w')) { newW = Math.max(40, startW - dx); newX = startLeft + dx }
      if (dir.includes('n')) { newH = Math.max(20, startH - dy); newY = startTop + dy }

      updateBlock(block.id, {
        width: newW,
        height: newH,
        x: newX,
        y: newY,
      } as any)
    }

    function onUp() {
      setResizing(null)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isFree ? { ...attributes, ...listeners } : { ...attributes, ...listeners })}
      data-block-id={block.id}
      className={`group relative transition-shadow duration-150 cursor-grab active:cursor-grabbing rounded-sm border-2 ${
        isSelected ? 'border-[var(--accent)]' : 'border-transparent hover:border-neutral-200'
      } ${isFree ? '' : 'mb-1'}`}
      onClick={(e) => {
        e.stopPropagation()
        selectBlock(block.id)
      }}
    >
      <div className="p-3 h-full">
        <BlockDisplay block={block} />
      </div>

      {/* Resize handles - 仅自由模式选中时显示 */}
      {isFree && isSelected && (
        <>
          {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map(dir => (
            <div
              key={dir}
              className="absolute bg-[var(--accent)] rounded-full"
              style={{
                width: 8,
                height: 8,
                cursor: `${dir}-resize`,
                ...(dir.includes('n') ? { top: -4 } : {}),
                ...(dir.includes('s') ? { bottom: -4 } : {}),
                ...(dir.includes('w') ? { left: -4 } : {}),
                ...(dir.includes('e') ? { right: -4 } : {}),
                ...(dir === 'n' || dir === 's' ? { left: 'calc(50% - 4px)' } : {}),
                ...(dir === 'e' || dir === 'w' ? { top: 'calc(50% - 4px)' } : {}),
              }}
              onMouseDown={(e) => handleResizeStart(e, dir)}
            />
          ))}
        </>
      )}

      {resizing && (
        <div className="absolute -bottom-6 left-0 text-[10px] text-neutral-400 whitespace-nowrap">
          {block.width > 0 ? Math.round(block.width) : 'auto'} × {block.height > 0 ? Math.round(block.height) : 'auto'}
        </div>
      )}
    </div>
  )
}

// ==================== BlockDisplay (不变) ====================

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
        ? <div style={{ backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #e5e5e5', ...sizeStyle, borderRadius: br }}><span style={{ opacity: 0.3, fontSize: '1.875rem', lineHeight: '2.25rem' }}>📷</span></div>
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
      return <div style={{ height: block.height || 20, width: '100%' }} />
  }
}

// ==================== Canvas ====================

export function Canvas() {
  const resumes = useResumeStore(s => s.resumes)
  const currentResumeId = useResumeStore(s => s.currentResumeId)
  const addBlock = useResumeStore(s => s.addBlock)
  const updateBlock = useResumeStore(s => s.updateBlock)
  const selectBlock = useEditorStore(s => s.selectBlock)
  const setDragging = useEditorStore(s => s.setDragging)

  const resume = resumes.find(r => r.id === currentResumeId)
  const blocks = resume?.blocks ?? []
  const isFree = resume?.layoutMode === 'free'

  const [activeDragType, setActiveDragType] = useState<BlockType | null>(null)
  const [activeBlock, setActiveBlock] = useState<Block | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

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

    const { active, over } = e

    // 从组件库拖入新块
    if (active.data.current?.type === 'library') {
      const blockType = active.data.current.blockType as BlockType
      if (isFree && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        // 在最近一次鼠标位置创建块（这里用画布中心偏移）
        const x = Math.max(0, (e.activatorEvent as MouseEvent)?.clientX - rect.left - 50 || 50)
        const y = Math.max(0, (e.activatorEvent as MouseEvent)?.clientY - rect.top - 20 || 20)
        addBlock(blockType)
        // 新块会在末尾，需要在这里设置它的 x/y
        const state = useResumeStore.getState()
        const resume = state.resumes.find(r => r.id === state.currentResumeId)
        const newBlock = resume?.blocks[resume.blocks.length - 1]
        if (newBlock) {
          updateBlock(newBlock.id, {
            x: Math.round(x),
            y: Math.round(y),
            width: 220,
            height: 0,
          } as any)
        }
      } else {
        addBlock(blockType)
      }
      setActiveDragType(null)
      return
    }

    setActiveBlock(null)

    // 自由模式：更新拖拽后的位置
    if (isFree && active && canvasRef.current && active.data.current?.type !== 'library') {
      const block = blocks.find(b => b.id === active.id)
      if (!block) return

      const rect = canvasRef.current.getBoundingClientRect()
      const mouseEvent = e.activatorEvent as MouseEvent
      const dx = (e.delta?.x || 0)
      const dy = (e.delta?.y || 0)
      const newX = Math.max(0, (block.x || 0) + dx)
      const newY = Math.max(0, (block.y || 0) + dy)

      // 每次拖拽结束时写入最终位置
      updateBlock(block.id, { x: Math.round(newX), y: Math.round(newY) } as any)
    }

    // 流模式：排序
    if (!isFree && over && active.id !== over.id) {
      // flow mode sorting handled by SortableContext
    }
  }

  if (!resume) return null

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <main className="flex-1 flex items-center justify-center p-4 bg-[var(--editor-bg)] overflow-hidden" onClick={() => selectBlock(null)}>
        <div
          id="resume-canvas"
          ref={canvasRef}
          className="bg-[var(--canvas-bg)] text-[var(--canvas-text)] shadow-[var(--shadow-lg)] rounded-sm transition-colors duration-200 overflow-hidden"
          style={{
            width: 794,
            maxWidth: '100%',
            maxHeight: '100%',
            aspectRatio: '210 / 297',
            position: 'relative',
          }}
        >
          {/* 自由模式：每个 block 绝对定位 */}
          {isFree && blocks.map(block => (
            <FreeBlock key={block.id} block={block} />
          ))}

          {/* 空画布提示 */}
          {isFree && blocks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ color: '#d1d5db' }}>
              <div className="text-center">
                <div className="text-6xl mb-4">📄</div>
                <p className="text-lg" style={{ color: '#9ca3af' }}>从左侧拖入拼图块开始制作简历</p>
                <p className="text-sm mt-2" style={{ color: '#d1d5db' }}>自由拖拽移动和调整大小</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <DragOverlay>
        {activeDragType && (
          <div className="px-3 py-2 rounded bg-white shadow-lg border border-[var(--accent)] text-xs opacity-80">
            {LIBRARY_ITEMS.find(i => i.type === activeDragType)?.icon} {LIBRARY_ITEMS.find(i => i.type === activeDragType)?.name}
          </div>
        )}
        {activeBlock && (
          <div className="scale-95 opacity-90 shadow-lg" style={{ width: activeBlock.width || 220 }}>
            <FreeBlock block={activeBlock} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

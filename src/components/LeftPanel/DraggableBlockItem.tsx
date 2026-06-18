import { useDraggable } from '@dnd-kit/core'
import type { LibraryItem } from './ComponentLibrary'

interface Props {
  item: LibraryItem
  onClick: () => void
}

export function DraggableBlockItem({ item, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `library-${item.type}`,
    data: { type: 'library', blockType: item.type },
  })

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0) scale(1.05)`
      : undefined,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 100 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className="flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-grab active:cursor-grabbing hover:bg-[var(--surface-hover)] transition-colors group border border-transparent hover:border-[var(--border-color)] select-none"
    >
      <span
        className="w-8 h-8 rounded-md flex items-center justify-center text-base shrink-0"
        style={{ backgroundColor: item.color + '12' }}
      >
        {item.icon}
      </span>
      <div className="min-w-0">
        <div className="text-xs font-medium text-[var(--editor-text)]">{item.name}</div>
        <div className="text-[11px] text-neutral-400 truncate">{item.description}</div>
      </div>
    </div>
  )
}

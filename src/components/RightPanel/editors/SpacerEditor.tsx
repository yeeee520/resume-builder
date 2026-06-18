import { useResumeStore } from '@/store/useResumeStore'
import type { SpacerBlock } from '@/store/types'

export function SpacerEditor({ block }: { block: SpacerBlock }) {
  const updateBlock = useResumeStore(s => s.updateBlock)

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1">
        <label className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium">高度</label>
        <div className="flex items-center gap-2">
          <input type="range" min={4} max={120} value={block.height} onChange={e => updateBlock(block.id, { height: Number(e.target.value) } as any)}
            className="flex-1 accent-[var(--accent)] h-1" />
          <span className="text-[11px] text-neutral-500 w-10 text-right">{block.height}px</span>
        </div>
      </div>
      <p className="text-[11px] text-neutral-400">在画布上创建可拖拽的垂直空白区域</p>
    </div>
  )
}

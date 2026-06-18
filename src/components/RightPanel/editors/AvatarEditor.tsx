import { useRef } from 'react'
import { useResumeStore } from '@/store/useResumeStore'
import type { AvatarBlock } from '@/store/types'

export function AvatarEditor({ block }: { block: AvatarBlock }) {
  const updateBlock = useResumeStore(s => s.updateBlock)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxSize = 400
        let w = img.width, h = img.height
        if (w > h) { h = h * (maxSize / w); w = maxSize } else { w = w * (maxSize / h); h = maxSize }
        Object.assign(canvas, { width: w, height: h })
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        updateBlock(block.id, { imageDataUrl: dataUrl } as any)
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1">
        <label className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium">头像图片</label>
        <button onClick={() => fileRef.current?.click()}
          className="w-full text-xs py-2 rounded border border-dashed border-[var(--border-color)] text-neutral-400 hover:text-neutral-600 hover:bg-[var(--surface-hover)] transition-colors">
          {block.imageDataUrl ? '更换图片' : '上传图片'}
        </button>
        {block.imageDataUrl && (
          <img src={block.imageDataUrl} className="w-16 h-16 rounded-full border object-cover mx-auto mt-1" />
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      <div className="space-y-1">
        <label className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium">形状</label>
        <div className="flex gap-2">
          <button onClick={() => updateBlock(block.id, { shape: 'circle' } as any)}
            className={`text-xs px-3 py-1.5 rounded border transition-colors ${block.shape === 'circle' ? 'bg-[var(--accent)] text-white' : 'bg-white'}`}>圆形</button>
          <button onClick={() => updateBlock(block.id, { shape: 'square' } as any)}
            className={`text-xs px-3 py-1.5 rounded border transition-colors ${block.shape === 'square' ? 'bg-[var(--accent)] text-white' : 'bg-white'}`}>方形</button>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium">大小</label>
        <div className="flex items-center gap-2">
          <input type="range" min={40} max={160} value={block.size} onChange={e => updateBlock(block.id, { size: Number(e.target.value) } as any)}
            className="flex-1 accent-[var(--accent)] h-1" />
          <span className="text-[11px] text-neutral-500 w-10 text-right">{block.size}px</span>
        </div>
      </div>
    </div>
  )
}

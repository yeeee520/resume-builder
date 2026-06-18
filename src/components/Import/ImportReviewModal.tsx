import { useState } from 'react'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/shared/Button'
import { useImportStore } from '@/store/useImportStore'
import { useResumeStore } from '@/store/useResumeStore'
import { createBlocks } from './BlockFactory'
import { toast } from '@/components/shared/Toast'
import type { ClassificationResult, BlockType } from '@/store/types'

const TYPE_OPTIONS: { value: BlockType | 'unknown'; label: string }[] = [
  { value: 'title', label: '标题块' },
  { value: 'paragraph', label: '正文块' },
  { value: 'timeline', label: '时间段块' },
  { value: 'skill-bar', label: '技能条' },
  { value: 'tag-group', label: '标签组' },
  { value: 'contact', label: '联系方式' },
  { value: 'divider', label: '分割线' },
  { value: 'unknown', label: '忽略' },
]

export function ImportReviewModal() {
  const classifications = useImportStore(s => s.classifications)
  const fileName = useImportStore(s => s.fileName)
  const fileType = useImportStore(s => s.fileType)
  const reset = useImportStore(s => s.reset)
  const setImporting = useImportStore(s => s.setImporting)
  const updateClassification = useImportStore(s => s.updateClassification)
  const removeClassification = useImportStore(s => s.removeClassification)
  const addBlocks = useResumeStore(s => s.addBlocks)

  const [localClassifications, setLocalClassifications] = useState<ClassificationResult[]>([...classifications])

  function handleTypeChange(index: number, blockType: BlockType | 'unknown') {
    const updated = [...localClassifications]
    updated[index] = { ...updated[index], blockType }
    setLocalClassifications(updated)
    updateClassification(index, { blockType })
  }

  function handleRemove(index: number) {
    setLocalClassifications(prev => prev.filter((_, i) => i !== index))
    removeClassification(index)
  }

  function handleConfirm() {
    const valid = localClassifications.filter(c => c.blockType !== 'unknown')
    if (valid.length === 0) {
      toast('info', '没有可导入的内容')
      reset()
      return
    }

    setImporting()
    const blocks = createBlocks(valid)
    addBlocks(blocks)
    reset()
    toast('success', `已导入 ${blocks.length} 个拼图块`)
  }

  return (
    <Modal
      open={true}
      onClose={reset}
      title={`📥 导入预览 — ${fileName}`}
      width="800px"
      footer={
        <>
          <Button variant="ghost" onClick={reset}>取消</Button>
          <Button variant="primary" onClick={handleConfirm}>
            确认导入 ({localClassifications.filter(c => c.blockType !== 'unknown').length} 个块)
          </Button>
        </>
      }
    >
      <div className="text-sm space-y-3">
        <p className="text-neutral-500">
          文件解析完成，共识别到 <strong>{localClassifications.length}</strong> 条内容。
          您可以修改每条内容的类型、删除不需要的条目，然后确认导入。
        </p>

        {localClassifications.length === 0 && (
          <div className="text-center py-12 text-neutral-400">
            <div className="text-4xl mb-2">📭</div>
            <p>未能识别到有效内容</p>
            <p className="text-xs mt-1">请尝试手动创建拼图块</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-neutral-400">
                <th className="text-left py-2 px-2 w-8">#</th>
                <th className="text-left py-2 px-2">内容预览</th>
                <th className="text-left py-2 px-2 w-32">识别为</th>
                <th className="text-left py-2 px-2 w-36">生成块类型</th>
                <th className="text-right py-2 px-2 w-12">操作</th>
              </tr>
            </thead>
            <tbody>
              {localClassifications.map((c, i) => (
                <tr key={i} className="border-b border-neutral-100 hover:bg-[var(--surface-hover)] transition-colors">
                  <td className="py-2 px-2 text-neutral-400">{i + 1}</td>
                  <td className="py-2 px-2">
                    <div className="max-w-xs truncate text-[var(--editor-text)]">{c.label}</div>
                    <div className="text-[11px] text-neutral-400">
                      {c.ruleName} · {c.confidence === 'high' ? '🟢' : c.confidence === 'medium' ? '🟡' : '🟠'} {c.confidence}
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                      c.confidence === 'high' ? 'bg-emerald-50 text-emerald-600' :
                      c.confidence === 'medium' ? 'bg-amber-50 text-amber-600' :
                      'bg-neutral-50 text-neutral-500'
                    }`}>
                      {c.ruleName === 'name' ? '姓名' :
                       c.ruleName === 'contact' ? '联系方式' :
                       c.ruleName === 'timeline' ? '经历' :
                       c.ruleName === 'heading' ? '章节标题' :
                       c.ruleName === 'skill' ? '技能' : '正文'}
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    <select
                      value={c.blockType}
                      onChange={e => handleTypeChange(i, e.target.value as BlockType | 'unknown')}
                      className="text-[11px] px-1.5 py-1 rounded border border-[var(--border-color)] bg-white text-[var(--editor-text)] outline-none"
                    >
                      {TYPE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-2 text-right">
                    <button
                      onClick={() => handleRemove(i)}
                      className="text-[11px] px-1 py-0.5 rounded text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  )
}

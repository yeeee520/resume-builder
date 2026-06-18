import { useRef } from 'react'
import { useImportStore } from '@/store/useImportStore'
import { toast } from '@/components/shared/Toast'

export function ImportSection() {
  const pdfRef = useRef<HTMLInputElement>(null)
  const docxRef = useRef<HTMLInputElement>(null)
  const startParse = useImportStore(s => s.startParse)

  function handlePDFImport() {
    pdfRef.current?.click()
  }

  function handleDocxImport() {
    docxRef.current?.click()
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'docx') {
    const file = e.target.files?.[0]
    if (!file) return

    startParse(file.name, type)

    // 立即显示预览占位（解析在 Modal 确认后完成，这里先做简单预览）
    // 完整解析和分类在 ImportReviewModal 的 useEffect 中完成
    const { parsePDF } = await import('@/components/Import/parsers/pdfParser')
    const { parseDocx } = await import('@/components/Import/parsers/docxParser')
    const { ContentClassifier } = await import('@/components/Import/classifier/ContentClassifier')

    try {
      const segments = type === 'pdf' ? await parsePDF(file) : await parseDocx(file)
      const classifier = new ContentClassifier()
      const classifications = classifier.classify(segments)

      const store = useImportStore.getState()
      store.setReview(segments, classifications)
    } catch (err: any) {
      const store2 = useImportStore.getState()
      store2.setError(err?.message || '解析失败')
      toast('error', `解析失败: ${err?.message || '未知错误'}`)
    }

    // 重置 input 以便重新选同一文件
    e.target.value = ''
  }

  return (
    <div className="border-t border-[var(--border-color)] p-3">
      <p className="text-[11px] font-semibold text-neutral-500 mb-2">📥 导入现有简历</p>
      <div className="flex flex-col gap-1.5">
        <button
          onClick={handlePDFImport}
          className="text-xs text-left px-2.5 py-1.5 rounded border border-[var(--border-color)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
        >
          📄 导入 PDF 简历
        </button>
        <button
          onClick={handleDocxImport}
          className="text-xs text-left px-2.5 py-1.5 rounded border border-[var(--border-color)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
        >
          📝 导入 Word 简历
        </button>
      </div>
      <p className="text-[11px] text-neutral-400 mt-1.5">自动识别内容并生成拼图块，支持预览后确认</p>

      <input ref={pdfRef} type="file" accept=".pdf" className="hidden" onChange={e => handleFile(e, 'pdf')} />
      <input ref={docxRef} type="file" accept=".docx" className="hidden" onChange={e => handleFile(e, 'docx')} />
    </div>
  )
}

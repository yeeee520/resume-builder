import { useRef } from 'react'
import { useImportStore } from '@/store/useImportStore'
import { toast } from '@/components/shared/Toast'

const KIMI_API_KEY = 'sk-Xfzmqy6VfneqVmp70Ix4DJ7l5Tfqqh4VyA3QFEh4eBbgBe2I'

export function ImportSection() {
  const pdfRef = useRef<HTMLInputElement>(null)
  const docxRef = useRef<HTMLInputElement>(null)
  const startParse = useImportStore(s => s.startParse)
  const setReview = useImportStore(s => s.setReview)
  const setError = useImportStore(s => s.setError)

  function handlePDFImport() {
    pdfRef.current?.click()
  }

  function handleDocxImport() {
    docxRef.current?.click()
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>, fileType: 'pdf' | 'docx') {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    startParse(file.name, fileType)

    try {
      if (fileType === 'pdf') {
        // === AI Vision 导入 ===
        await handlePDFWithVision(file)
      } else {
        // === Word 保持原有方案 ===
        const { parseDocx } = await import('@/components/Import/parsers/docxParser')
        const { ContentClassifier } = await import('@/components/Import/classifier/ContentClassifier')
        const segments = await parseDocx(file)
        const classifier = new ContentClassifier()
        const classifications = classifier.classify(segments)
        setReview(segments, classifications)
      }
    } catch (err: any) {
      console.error('Import error:', err)
      setError(err?.message || '解析失败')
      toast('error', `导入失败: ${err?.message || '未知错误'}`)
    }
  }

  async function handlePDFWithVision(file: File) {
    toast('info', '正在用 AI 分析简历页面...')

    const buffer = await file.arrayBuffer()
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString()

    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise

    // 每页渲染为图片
    const pageImages: Array<{ page: number; base64: string; width: number; height: number }> = []
    const scale = 2 // 2x scale for better AI accuracy

    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i + 1)
      const viewport = page.getViewport({ scale })

      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')!

      await page.render({ canvas, viewport }).promise

      const base64 = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '')
      pageImages.push({
        page: i,
        base64,
        width: viewport.width,
        height: viewport.height,
      })
    }

    toast('info', `正在让 AI 识别 ${pdf.numPages} 页简历内容...`)

    // 调用 Kimi Vision
    const { analyzeResumePDF } = await import('@/components/Import/kimiClient')
    const results = await analyzeResumePDF(pageImages, KIMI_API_KEY)

    // 将 Vision 结果转为 classifications
    const { convertVisionToClassifications } = await import('@/components/Import/kimiConverter')
    const classifications = convertVisionToClassifications(results, 794) // A4 宽度

    setReview([], classifications)
    toast('success', `AI 识别完成，共 ${classifications.length} 个区块`)
  }

  return (
    <div className="border-t border-[var(--border-color)] p-3">
      <p className="text-[11px] font-semibold text-neutral-500 mb-2">📥 导入现有简历</p>
      <div className="flex flex-col gap-1.5">
        <button
          onClick={handlePDFImport}
          className="text-xs text-left px-2.5 py-2 rounded border border-[var(--border-color)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
        >
          <span className="font-medium">📄 导入 PDF 简历</span>
          <span className="text-[10px] text-neutral-400 ml-2">AI 智能识别</span>
        </button>
        <button
          onClick={handleDocxImport}
          className="text-xs text-left px-2.5 py-1.5 rounded border border-[var(--border-color)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
        >
          📝 导入 Word 简历
        </button>
      </div>
      <p className="text-[11px] text-neutral-400 mt-1.5">PDF 使用 AI 视觉识别 · Word 使用规则解析</p>

      <input ref={pdfRef} type="file" accept=".pdf" className="hidden" onChange={e => handleFile(e, 'pdf')} />
      <input ref={docxRef} type="file" accept=".docx" className="hidden" onChange={e => handleFile(e, 'docx')} />
    </div>
  )
}

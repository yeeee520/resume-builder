import { useEffect, useCallback, useRef } from 'react'
import { useResumeStore } from '@/store/useResumeStore'
import { useEditorStore } from '@/store/useEditorStore'
import { useThemeStore } from '@/store/useThemeStore'
import { useImportStore } from '@/store/useImportStore'
import { LeftPanel } from '@/components/LeftPanel'
import { Canvas } from '@/components/Canvas'
import { RightPanel } from '@/components/RightPanel'
import { ToastContainer } from '@/components/shared/Toast'
import { ImportReviewModal } from '@/components/Import/ImportReviewModal'
import { toast } from '@/components/shared/Toast'

export default function App() {
  const currentResumeId = useResumeStore(s => s.currentResumeId)
  const currentResume = useResumeStore(s => s.resumes.find(r => r.id === s.currentResumeId))
  const resumes = useResumeStore(s => s.resumes)
  const addResume = useResumeStore(s => s.addResume)
  const undo = useResumeStore(s => s.undo)
  const redo = useResumeStore(s => s.redo)
  const pastLen = useResumeStore(s => s.past.length)
  const futureLen = useResumeStore(s => s.future.length)

  const leftPanelOpen = useEditorStore(s => s.leftPanelOpen)
  const rightPanelOpen = useEditorStore(s => s.rightPanelOpen)
  const toggleLeftPanel = useEditorStore(s => s.toggleLeftPanel)
  const toggleRightPanel = useEditorStore(s => s.toggleRightPanel)
  const selectBlock = useEditorStore(s => s.selectBlock)

  const setTheme = useThemeStore(s => s.setTheme)
  const currentThemeId = useThemeStore(s => s.currentThemeId)

  const importStatus = useImportStore(s => s.status)

  const jsonInputRef = useRef<HTMLInputElement>(null)

  // 首次加载
  useEffect(() => {
    if (!currentResumeId) {
      addResume('我的简历')
    }
    setTheme(currentThemeId)
  }, [])

  // 全局快捷键
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return
    if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo() }
    else if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo() }
    else if (e.ctrlKey && e.key === 'b') { e.preventDefault(); toggleLeftPanel() }
    else if (e.ctrlKey && e.key === '\\') { e.preventDefault(); toggleRightPanel() }
  }, [undo, redo, toggleLeftPanel, toggleRightPanel])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // 导出 JSON
  function handleExportJSON() {
    if (!currentResume) return
    const blob = new Blob([JSON.stringify(currentResume, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentResume.name}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast('success', 'JSON 简历已导出')
  }

  // 导入 JSON
  function handleImportJSON() {
    jsonInputRef.current?.click()
  }

  function handleJSONFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (!data.blocks || !Array.isArray(data.blocks)) {
          throw new Error('无效的简历文件')
        }
        addResume(data.name || '导入的简历')
        // Switch to the new resume and add blocks
        const { resumes, currentResumeId, addBlocks, switchResume } = useResumeStore.getState()
        const newResume = resumes[resumes.length - 1]
        if (newResume) {
          switchResume(newResume.id)
          addBlocks(data.blocks)
          toast('success', `已导入简历 "${data.name}"`)
        }
      } catch (err) {
        toast('error', 'JSON 文件格式不正确')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // 导出 PDF
  async function handleExportPDF() {
    try {
      const html2canvas = (await import('html2canvas')).default
      const jsPDFModule = await import('jspdf')
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default
      const canvas = document.getElementById('resume-canvas')
      if (!canvas) {
        toast('error', '未找到简历画布')
        return
      }

      toast('info', '正在生成 PDF...')
      // 导出前将 canvas 中所有 oklch 色值临时替换为计算后的 rgb
      const allEls = canvas.querySelectorAll('*')
      const originalColors: Array<{ el: HTMLElement; style: string }> = []
      allEls.forEach((el) => {
        if (!(el instanceof HTMLElement)) return
        const orig = el.style.color || ''
        originalColors.push({ el, style: orig })
      })
      const result = await html2canvas(canvas, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // 遍历克隆文档，将 oklch 色值全部替换
          clonedDoc.querySelectorAll('*').forEach((el: any) => {
            if (!el.style) return
            // Fix color
            if (el.style.color && el.style.color.includes('oklch')) {
              el.style.color = el.style.color.replace(/oklch\([^)]+\)/g, '#1a1a1a')
            }
            if (el.style.backgroundColor && el.style.backgroundColor.includes('oklch')) {
              el.style.backgroundColor = el.style.backgroundColor.replace(/oklch\([^)]+\)/g, '#ffffff')
            }
            if (el.style.borderColor && el.style.borderColor.includes('oklch')) {
              el.style.borderColor = el.style.borderColor.replace(/oklch\([^)]+\)/g, '#d1d5db')
            }
          })
        },
      })
      const imgData = result.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pdfWidth
      const imgHeight = (result.height * pdfWidth) / result.width

      let heightLeft = imgHeight
      let position = 0
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight
      while (heightLeft > 0) {
        position = position - pdfHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight
      }
      pdf.save(`${currentResume?.name || '我的简历'}.pdf`)
      toast('success', 'PDF 导出成功')
    } catch (err: any) {
      console.error('PDF export error:', err)
      toast('error', 'PDF 导出失败: ' + (err?.message || '未知错误'))
    }
  }

  return (
    <div className="flex flex-col h-full bg-[var(--editor-bg)] text-[var(--editor-text)] select-none text-[14px]">
      <div className="flex-1 flex overflow-hidden">
        {leftPanelOpen && <LeftPanel />}
        {!leftPanelOpen && (
          <button onClick={toggleLeftPanel} className="shrink-0 w-6 border-r border-[var(--border-color)] bg-[var(--panel-bg)] text-neutral-400 hover:text-neutral-600 text-xs flex items-center justify-center" title="Ctrl+B 展开">▶</button>
        )}

        <Canvas />

        {rightPanelOpen && <RightPanel />}
        {!rightPanelOpen && (
          <button onClick={toggleRightPanel} className="shrink-0 w-6 border-l border-[var(--border-color)] bg-[var(--panel-bg)] text-neutral-400 hover:text-neutral-600 text-xs flex items-center justify-center" title="Ctrl+\ 展开">◀</button>
        )}
      </div>

      {/* 底栏 */}
      <footer className="h-11 border-t border-[var(--border-color)] bg-[var(--panel-bg)]/80 backdrop-blur-md flex items-center px-3 gap-2 shrink-0">
        <span className="text-[11px] text-neutral-400 font-mono tracking-tight">简历拼图构建器</span>
        <button onClick={undo} disabled={pastLen === 0} className="h-6 px-1.5 text-[11px] rounded hover:bg-[var(--surface-hover)] disabled:opacity-30 flex items-center gap-1" title="Ctrl+Z">↩ 撤销</button>
        <button onClick={redo} disabled={futureLen === 0} className="h-6 px-1.5 text-[11px] rounded hover:bg-[var(--surface-hover)] disabled:opacity-30 flex items-center gap-1" title="Ctrl+Y">↪ 重做</button>
        <div className="w-px h-4 bg-[var(--border-color)]" />
        <span className="text-[11px] text-neutral-500">{currentResume?.name || '无简历'}</span>
        <div className="flex-1" />
        <span className="text-[11px] text-neutral-400">主题:</span>
        <select value={currentThemeId} onChange={e => setTheme(e.target.value)} className="text-[11px] bg-transparent border border-[var(--border-color)] rounded px-1 py-0.5">
          <option value="modern-blue">现代蓝色</option>
          <option value="classic-bw">经典黑白</option>
          <option value="minimal-gray">简约灰白</option>
        </select>
        <div className="w-px h-4 bg-[var(--border-color)]" />
        <button onClick={handleImportJSON} className="text-[11px] px-1.5 rounded hover:bg-[var(--surface-hover)]">📁 导入JSON</button>
        <button onClick={handleExportJSON} className="text-[11px] px-1.5 rounded hover:bg-[var(--surface-hover)]">📤 导出JSON</button>
        <input ref={jsonInputRef} type="file" accept=".json" className="hidden" onChange={handleJSONFile} />
        <div className="w-px h-4 bg-[var(--border-color)]" />
        <button onClick={handleExportPDF} className="text-[11px] px-2 py-1 rounded bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] font-medium">🖨️ 导出 PDF</button>
      </footer>

      <ToastContainer />
      {importStatus === 'reviewing' && <ImportReviewModal />}
    </div>
  )
}

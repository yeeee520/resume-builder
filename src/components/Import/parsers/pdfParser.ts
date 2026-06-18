import type { TextSegment } from '@/store/types'

// pdfjs-dist 懒加载
async function loadPdfJs() {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString()
  return pdfjsLib
}

export async function parsePDF(file: File): Promise<TextSegment[]> {
  const buffer = await file.arrayBuffer()
  const pdfjsLib = await loadPdfJs()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise

  const segments: TextSegment[] = []
  let index = 0

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()

    // pdfjs items are typed broadly — we need to check for text items
    const items = (textContent as any).items || []

    for (const item of items) {
      const text = (item.str as string)?.trim()
      if (!text) continue

      // Group text on the same Y line? For simplicity, emit each item as a segment
      segments.push({
        text,
        index: index++,
        metadata: {
          fontSize: item.transform?.[0] ?? undefined,
          page: pageNum,
          y: item.transform?.[5] ?? undefined,
        },
      })
    }
  }

  // Sort by page → y (descending, since PDF y goes bottom-up, we reverse for top-down)
  segments.sort((a, b) => {
    const pageA = a.metadata.page ?? 1
    const pageB = b.metadata.page ?? 1
    if (pageA !== pageB) return pageA - pageB
    return (b.metadata.y ?? 0) - (a.metadata.y ?? 0)
  })

  // Merge lines that are on the same Y (tolerance 2px) — combine horizontally
  const merged: TextSegment[] = []
  let current = segments[0]
  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i]
    const samePage = seg.metadata.page === current.metadata.page
    const sameY = samePage && Math.abs((seg.metadata.y ?? 0) - (current.metadata.y ?? 0)) < 3
    if (sameY) {
      current.text += ' ' + seg.text
      if ((seg.metadata.fontSize ?? 0) > (current.metadata.fontSize ?? 0)) {
        current.metadata.fontSize = seg.metadata.fontSize
      }
    } else {
      merged.push(current)
      current = seg
    }
  }
  if (current) merged.push(current)

  return merged
}

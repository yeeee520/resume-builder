import type { TextSegment } from '@/store/types'

// mammoth 懒加载
async function loadMammoth() {
  const mammoth = await import('mammoth')
  return mammoth.default
}

export async function parseDocx(file: File): Promise<TextSegment[]> {
  const buffer = await file.arrayBuffer()
  const mammoth = await loadMammoth()

  // Use convertToHtml to preserve semantic tags (headings, bold, lists)
  const result = await mammoth.convertToHtml({ arrayBuffer: buffer })
  const html = result.value

  // Parse HTML
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const body = doc.body

  const segments: TextSegment[] = []
  let index = 0

  for (const child of body.children) {
    const text = child.textContent?.trim()
    if (!text) continue

    const tagName = child.tagName.toLowerCase()
    let isBold = false
    let isHeading = false

    if (tagName === 'strong' || child.querySelector('strong')) {
      isBold = true
    }

    let tag = tagName
    if (/^h[1-6]$/.test(tagName)) {
      isHeading = true
      tag = tagName
    } else if (tagName === 'p') {
      // Check if first child is strong — likely a heading-like label
      const firstChild = child.children[0]
      if (firstChild?.tagName === 'STRONG' && text.length <= 25) {
        isBold = true
        isHeading = true
      }
    } else if (tagName === 'li') {
      tag = 'list-item'
    }

    segments.push({
      text,
      index: index++,
      metadata: {
        isBold,
        htmlTag: tag,
        fontSize: isHeading ? (tagName === 'h1' ? 28 : tagName === 'h2' ? 22 : 16) : 14,
      },
    })
  }

  return segments
}

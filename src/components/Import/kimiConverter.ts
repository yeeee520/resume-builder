import type { VisionPageResult, VisionBlockResult } from './kimiClient'
import type { ClassificationResult } from '@/store/types'
import { nanoid } from 'nanoid'

/**
 * 将 Kimi Vision 返回的区块坐标转换为 classification 结果
 * 适配 794px 宽的 A4 画布
 */
export function convertVisionToClassifications(
  pageResults: VisionPageResult[],
  targetWidth: number,
): ClassificationResult[] {
  const results: ClassificationResult[] = []

  for (const page of pageResults) {
    const scale = targetWidth / page.width

    for (const b of page.blocks) {
      // 将像素坐标转为画布坐标，并缩放适配 A4 宽度
      const data: Record<string, unknown> = {
        content: b.content,
        x: Math.round(b.x * scale),
        y: Math.round(b.y * scale),
        width: Math.round(b.width * scale),
        height: Math.round(b.height * scale),
        originPage: page.page,
      }

      // 映射类型
      let blockType: ClassificationResult['blockType'] = 'unknown'
      switch (b.type) {
        case 'title':
          blockType = 'title'; break
        case 'paragraph':
          blockType = 'paragraph'; break
        case 'timeline':
          blockType = 'timeline'; break
        case 'skill-bar':
          blockType = 'skill-bar'; break
        case 'tag-group':
          blockType = 'tag-group'; break
        case 'contact':
          blockType = 'contact'; break
        case 'divider':
          blockType = 'divider'; break
        case 'avatar':
          blockType = 'avatar'; break
        default:
          blockType = 'paragraph'
      }

      results.push({
        segmentIndices: [],
        blockType,
        confidence: b.confidence >= 0.7 ? 'high' : b.confidence >= 0.4 ? 'medium' : 'low',
        label: b.content?.substring(0, 40) || `区块 (${b.x},${b.y})`,
        data,
        ruleName: 'kimi-vision',
      })
    }
  }

  return results
}

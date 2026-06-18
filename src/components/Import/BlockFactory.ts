import { nanoid } from 'nanoid'
import type { Block, ClassificationResult, TimelineItem } from '@/store/types'
import {
  defaultTitleStyle,
  defaultParagraphStyle,
  defaultDividerStyle,
  defaultSkillBarStyle,
  defaultTimelineStyle,
  defaultContactStyle,
} from '@/store/types'

export function createBlocks(classifications: ClassificationResult[]): Block[] {
  return classifications
    .filter(c => c.blockType !== 'unknown')
    .map((c, index): Block | null => {
      const base = { id: nanoid(8), order: index, x: 0, y: 0, width: 0, height: 0, zIndex: index } as const

      switch (c.blockType) {
        case 'title':
          return {
            ...base,
            type: 'title' as const,
            content: (c.data.content as string) || c.label,
            level: (c.data.level as 'h1' | 'h2' | 'h3') || 'h2',
            style: { ...defaultTitleStyle, fontSize: (c.data.level === 'h1' ? 28 : 20) },
          }

        case 'paragraph':
          return {
            ...base,
            type: 'paragraph' as const,
            content: c.data.content as string || c.label,
            style: { ...defaultParagraphStyle },
          }

        case 'timeline': {
          const items = c.data.items as TimelineItem[] | undefined
          return {
            ...base,
            type: 'timeline' as const,
            items: (items || [{
              id: nanoid(8),
              dateRange: '',
              title: c.label,
              description: '',
            }]).map((item: TimelineItem) => ({
              ...item,
              id: item.id || nanoid(8),
            })),
            style: { ...defaultTimelineStyle },
          }
        }

        case 'skill-bar':
          return {
            ...base,
            type: 'skill-bar' as const,
            label: (c.data.label as string) || c.label,
            level: (c.data.level as number) || 50,
            style: { ...defaultSkillBarStyle },
          }

        case 'tag-group': {
          const tags = c.data.tags as Array<{ id?: string; text: string; color?: string }> | undefined
          return {
            ...base,
            type: 'tag-group' as const,
            tags: (tags || [{ text: c.label, color: '#2563eb' }]).map(tag => ({
              id: tag.id || nanoid(8),
              text: tag.text,
              color: tag.color || '#2563eb',
            })),
          }
        }

        case 'contact': {
          const items = c.data.items as Array<{ label: string; value: string }> | undefined
          return {
            ...base,
            type: 'contact' as const,
            items: (items || [{ label: '联系方式', value: c.label }]).map(item => ({
              id: nanoid(8),
              label: item.label,
              value: item.value,
            })),
            style: { ...defaultContactStyle },
          }
        }

        case 'divider':
          return {
            ...base,
            type: 'divider' as const,
            style: { ...defaultDividerStyle },
          }

        default:
          return null
      }
    })
    .filter(Boolean) as Block[]
}

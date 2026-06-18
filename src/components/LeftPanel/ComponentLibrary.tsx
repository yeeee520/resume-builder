import type { BlockType } from '@/store/types'

export interface LibraryItem {
  type: BlockType
  name: string
  icon: string
  description: string
  color: string
}

export const LIBRARY_ITEMS: LibraryItem[] = [
  { type: 'title', name: '标题', icon: '🔤', description: 'H1/H2/H3 标题文字', color: '#1a1a1a' },
  { type: 'paragraph', name: '正文', icon: '📝', description: '多行文本段落', color: '#4b5563' },
  { type: 'divider', name: '分割线', icon: '➖', description: '视觉分割线', color: '#9ca3af' },
  { type: 'skill-bar', name: '技能条', icon: '📊', description: '技能名称 + 进度', color: '#2563eb' },
  { type: 'timeline', name: '时间段', icon: '📅', description: '教育/工作经历', color: '#059669' },
  { type: 'avatar', name: '头像', icon: '🖼️', description: '个人照片或图标', color: '#7c3aed' },
  { type: 'tag-group', name: '标签组', icon: '🏷️', description: '一组标签/关键词', color: '#db2777' },
  { type: 'contact', name: '联系方式', icon: '📞', description: '电话/邮箱/链接', color: '#ea580c' },
  { type: 'spacer', name: '间距', icon: '⬜', description: '可调节空白区域', color: '#94a3b8' },
]

export function getLibraryItem(type: BlockType): LibraryItem | undefined {
  return LIBRARY_ITEMS.find(i => i.type === type)
}

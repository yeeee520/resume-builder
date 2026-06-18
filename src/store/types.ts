// ==================== Block 类型定义 ====================

export type BlockType =
  | 'title'
  | 'paragraph'
  | 'divider'
  | 'skill-bar'
  | 'timeline'
  | 'avatar'
  | 'tag-group'
  | 'contact'
  | 'spacer'

export interface BlockBase {
  id: string
  type: BlockType
  order: number
}

// 标题块
export interface TitleBlock extends BlockBase {
  type: 'title'
  content: string
  level: 'h1' | 'h2' | 'h3'
  style: TitleStyle
}

export interface TitleStyle {
  bold: boolean
  italic: boolean
  underline: boolean
  color: string
  fontSize: number
}

// 正文块
export interface ParagraphBlock extends BlockBase {
  type: 'paragraph'
  content: string
  style: ParagraphStyle
}

export interface ParagraphStyle {
  color: string
  fontSize: number
  lineHeight: number
}

// 分割线块
export interface DividerBlock extends BlockBase {
  type: 'divider'
  style: DividerStyle
}

export interface DividerStyle {
  thickness: number
  color: string
  dash: boolean
  marginTop: number
  marginBottom: number
}

// 技能条块
export interface SkillBarBlock extends BlockBase {
  type: 'skill-bar'
  label: string
  level: number
  style: SkillBarStyle
}

export interface SkillBarStyle {
  color: string
  barColor: string
  bgColor: string
  fontSize: number
}

// 时间段块
export interface TimelineBlock extends BlockBase {
  type: 'timeline'
  items: TimelineItem[]
  style: TimelineStyle
}

export interface TimelineItem {
  id: string
  dateRange: string
  title: string
  description: string
}

export interface TimelineStyle {
  color: string
  fontSize: number
  lineColor: string
}

// 头像块
export interface AvatarBlock extends BlockBase {
  type: 'avatar'
  imageDataUrl: string | null
  shape: 'circle' | 'square'
  size: number
}

// 标签组块
export interface TagGroupBlock extends BlockBase {
  type: 'tag-group'
  tags: TagItem[]
}

export interface TagItem {
  id: string
  text: string
  color: string
}

// 联系方式块
export interface ContactBlock extends BlockBase {
  type: 'contact'
  items: ContactItem[]
  style: ContactStyle
}

export interface ContactItem {
  id: string
  label: string
  value: string
}

export interface ContactStyle {
  layout: 'horizontal' | 'vertical'
  fontSize: number
  color: string
}

// 间距块
export interface SpacerBlock extends BlockBase {
  type: 'spacer'
  height: number
}

// ==================== Block 联合类型 ====================

export type Block =
  | TitleBlock
  | ParagraphBlock
  | DividerBlock
  | SkillBarBlock
  | TimelineBlock
  | AvatarBlock
  | TagGroupBlock
  | ContactBlock
  | SpacerBlock

// ==================== 简历 ====================

export interface Resume {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  blocks: Block[]
  themeId: string
}

// ==================== 主题 ====================

export interface ThemeVars {
  [key: string]: string
}

export interface ThemeDef {
  id: string
  name: string
  vars: ThemeVars
}

// ==================== 编辑器状态 ====================

export interface EditorState {
  selectedBlockId: string | null
  isDragging: boolean
  leftPanelOpen: boolean
  rightPanelOpen: boolean
}

// ==================== 导入相关类型 ====================

export type ImportStatus =
  | 'idle'
  | 'parsing'
  | 'reviewing'
  | 'importing'
  | 'done'
  | 'error'

export interface TextSegment {
  text: string
  index: number
  metadata: {
    fontSize?: number
    isBold?: boolean
    page?: number
    y?: number
    htmlTag?: string
  }
}

export interface ClassificationResult {
  segmentIndices: number[]
  blockType: BlockType | 'unknown'
  confidence: 'high' | 'medium' | 'low'
  label: string
  data: Record<string, unknown>
  ruleName: string
}

export interface ImportState {
  status: ImportStatus
  segments: TextSegment[]
  classifications: ClassificationResult[]
  fileName: string
  fileType: 'pdf' | 'docx' | null
  errorMessage: string | null
}

// ==================== 默认样式 ====================

export const defaultTitleStyle: TitleStyle = {
  bold: false,
  italic: false,
  underline: false,
  color: '#1a1a1a',
  fontSize: 24,
}

export const defaultParagraphStyle: ParagraphStyle = {
  color: '#1a1a1a',
  fontSize: 14,
  lineHeight: 1.6,
}

export const defaultDividerStyle: DividerStyle = {
  thickness: 1,
  color: '#d1d5db',
  dash: false,
  marginTop: 12,
  marginBottom: 12,
}

export const defaultSkillBarStyle: SkillBarStyle = {
  color: '#1a1a1a',
  barColor: '#2563eb',
  bgColor: '#e5e7eb',
  fontSize: 14,
}

export const defaultTimelineStyle: TimelineStyle = {
  color: '#1a1a1a',
  fontSize: 14,
  lineColor: '#d1d5db',
}

export const defaultContactStyle: ContactStyle = {
  layout: 'horizontal',
  fontSize: 14,
  color: '#1a1a1a',
}

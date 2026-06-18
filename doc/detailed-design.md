# Detailed Design

## Project Structure

```
my-resume/
├── 启动简历编辑器.bat
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── store/
│   │   ├── useResumeStore.ts
│   │   ├── useEditorStore.ts
│   │   ├── useThemeStore.ts
│   │   ├── useImportStore.ts        # 新增：导入流程状态
│   │   └── types.ts
│   ├── components/
│   │   ├── LeftPanel/
│   │   │   ├── index.tsx
│   │   │   ├── ComponentLibrary.tsx
│   │   │   ├── DraggableBlockItem.tsx
│   │   │   └── ImportSection.tsx     # 新增：导入 PDF/Word 入口
│   │   ├── Canvas/
│   │   │   ├── index.tsx
│   │   │   ├── BlockRenderer.tsx
│   │   │   └── SortableBlock.tsx
│   │   ├── RightPanel/
│   │   │   ├── index.tsx
│   │   │   └── editors/
│   │   │       ├── TitleEditor.tsx
│   │   │       ├── ParagraphEditor.tsx
│   │   │       ├── DividerEditor.tsx
│   │   │       ├── SkillBarEditor.tsx
│   │   │       ├── TimelineEditor.tsx
│   │   │       ├── AvatarEditor.tsx
│   │   │       ├── TagGroupEditor.tsx
│   │   │       ├── ContactEditor.tsx
│   │   │       └── SpacerEditor.tsx
│   │   ├── BottomBar/
│   │   │   ├── index.tsx
│   │   │   ├── UndoRedo.tsx
│   │   │   ├── ThemeSwitcher.tsx
│   │   │   ├── ResumeSwitcher.tsx
│   │   │   ├── ExportPDF.tsx
│   │   │   └── ImportExport.tsx
│   │   ├── Import/                    # 新增：智能导入模块
│   │   │   ├── ImportReviewModal.tsx  # 预览确认弹层
│   │   │   ├── parsers/
│   │   │   │   ├── pdfParser.ts       # PDF 文本提取
│   │   │   │   └── docxParser.ts      # Word 文本提取
│   │   │   ├── classifier/
│   │   │   │   ├── ContentClassifier.ts  # 核心分类引擎
│   │   │   │   ├── ruleRegistry.ts       # 规则注册表
│   │   │   │   └── rules/
│   │   │   │       ├── nameRule.ts       # 姓名识别
│   │   │   │       ├── contactRule.ts    # 联系方式识别
│   │   │   │       ├── timelineRule.ts   # 时间线识别
│   │   │   │       ├── skillRule.ts      # 技能识别
│   │   │   │       ├── headingRule.ts    # 章节标题识别
│   │   │   │       └── paragraphRule.ts  # 正文兜底
│   │   │   └── BlockFactory.ts        # 分类结果 → Block 对象
│   │   └── shared/
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       ├── Tooltip.tsx
│   │       └── Toast.tsx              # 新增：轻提示
│   ├── themes/
│   │   └── index.ts
│   └── utils/
│       ├── exportPdf.ts
│       ├── importExport.ts
│       └── localStorage.ts
└── public/
    └── favicon.svg
```

## Module Responsibilities

### `store/types.ts`
- 定义所有 TypeScript 类型/接口
- Block 联合类型、Resume、Theme、EditorState 等
- **新增**：ImportState、TextSegment、ClassifiedSegment、ImportRule 等导入相关类型

### `store/useResumeStore.ts`
- **职责**：简历数据 CRUD
- **关键方法**：
  - `addResume(name)` → 新建简历
  - `deleteResume(id)` → 删除简历
  - `switchResume(id)` → 切换当前简历
  - `addBlock(type, index?)` → 添加单个块
  - `addBlocks(blocks)` → **新增**：批量添加块（导入用，作为单次撤销操作）
  - `updateBlock(id, patch)` → 更新块属性
  - `removeBlock(id)` → 删除块
  - `moveBlock(id, newIndex)` → 排序
  - `duplicateBlock(id)` → 复制块
- **中间件**：immer（不可变更新）+ 自定义 undoMiddleware（历史栈）
- **持久化**：localStorage 同步，使用 Zustand persist middleware

### `store/useEditorStore.ts`
- **职责**：编辑器 UI 状态
- **数据**：`selectedBlockId`, `isDragging`, `leftPanelOpen`, `rightPanelOpen`

### `store/useThemeStore.ts`
- **职责**：当前主题 ID 及其在 document 上的 CSS 变量注入
- **持久化**：localStorage

### `store/useImportStore.ts` — **新增**
- **职责**：智能导入全流程状态管理
- **状态机**：`idle → parsing → reviewing → importing → done → idle`
```
idle          # 初始/已重置
parsing       # 正在用 pdfjs-dist/mammoth.js 提取文本
reviewing     # 展示 ImportReviewModal，等待用户确认
importing     # 用户确认后，BlockFactory 批量生成 blocks，插入 store
done          # 短暂状态，显示 Toast，然后重置回 idle
error         # 解析/分类出错
```
- **数据**：
  - `status`: ImportStatus
  - `classifications: ClassifiedSegment[]`  # 分类结果
  - `fileName: string`
  - `fileType: 'pdf' | 'docx'`
  - `errorMessage?: string`

---

### 智能导入模块详细设计 — **新增核心模块**

#### `ImportSection.tsx`（LeftPanel 底部的导入按钮区）
```
┌──────────────────────────┐
│  📥 导入现有简历          │
│  ┌──────────────────────┐│
│  │  📄 导入 PDF 简历    ││
│  │  📝 导入 Word 简历   ││
│  └──────────────────────┘│
│  支持自动识别内容并生成   │
│  拼图块，可预览后确认     │
└──────────────────────────┘
```

- 两个按钮，点击触发 `<input type="file" accept=".pdf,.docx">`
- 选文件后调用对应 parser

#### `pdfParser.ts`
```typescript
// 依赖：pdfjs-dist (bundle size ~2MB，使用 CDN 或 dynamic import 懒加载)
import * as pdfjsLib from 'pdfjs-dist'

// 设置 worker（必须，使用 CDN 或本地文件）
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

interface ParsedTextSegment {
  text: string
  page: number
  y: number         // 纵坐标（用于判断阅读顺序）
  fontSize: number
  isBold: boolean
}

async function parsePDF(file: File): Promise<ParsedTextSegment[]> {
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise

  const segments: ParsedTextSegment[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()

    for (const item of textContent.items) {
      if ('str' in item && item.str.trim()) {
        segments.push({
          text: item.str.trim(),
          page: i,
          y: item.transform[5],  // Y 坐标
          fontSize: item.transform[0], // 近似字号
          isBold: false,  // pdfjs 不直接提供 bold，需从 fontName 推断
        })
      }
    }
  }

  // 按 page → y 排序
  segments.sort((a, b) => a.page - b.page || a.y - b.y)
  return segments
}
```

**注意**：pdfjs-dist 约 2MB，建议 dynamic import 懒加载，仅在用户点击导入时才加载。

#### `docxParser.ts`
```typescript
// 依赖：mammoth.js (bundle size ~500KB，同样懒加载)
import mammoth from 'mammoth'

interface DocxParsedSegment {
  text: string
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'list-item'
  isBold: boolean
}

async function parseDocx(file: File): Promise<DocxParsedSegment[]> {
  const buffer = await file.arrayBuffer()

  const result = await mammoth.extractRawText({
    arrayBuffer: buffer,
  })

  // mammoth 的 raw text 不保留样式信息……
  // 需要改用 mammoth.convertToHtml() 来保留 <h1>/<strong>/<li> 标记
  const html = await mammoth.convertToHtml({ arrayBuffer: buffer })

  // 解析 HTML，提取语义标记
  const parser = new DOMParser()
  const doc = parser.parseFromString(html.value, 'text/html')

  const segments: DocxParsedSegment[] = []
  for (const el of doc.body.children) {
    const text = el.textContent?.trim()
    if (!text) continue

    const tagName = el.tagName.toLowerCase()
    let type: DocxParsedSegment['type'] = 'paragraph'
    let isBold = false

    if (tagName.match(/^h[1-3]$/)) {
      type = tagName as 'heading1' | 'heading2' | 'heading3'
    } else if (tagName === 'li') {
      type = 'list-item'
    }
    if (el.querySelector('strong')) isBold = true

    segments.push({ text, type, isBold })
  }

  return segments
}
```

#### `ContentClassifier.ts`
```typescript
// 核心分类引擎 —— 规则流水线

interface TextSegment {
  text: string
  index: number
  metadata: Record<string, unknown>  // 解析器附带的元数据（fontSize, isBold, page, y 等）
}

interface ClassificationResult {
  segmentIndex: number
  blockType: BlockType | 'unknown'
  confidence: 'high' | 'medium' | 'low'
  data: Record<string, unknown>  // 具体 block 的初始化数据
  ruleName: string
}

class ContentClassifier {
  private rules: ClassifierRule[] = []

  constructor() {
    // 按优先级注册规则
    this.rules = [
      new ContactRule(),    // 优先级最高：正则匹配不易误判
      new TimelineRule(),   // 日期模式匹配
      new NameRule(),       // 首段 / 大字号
      new HeadingRule(),    // 短+加粗 → 章节标题
      new SkillRule(),      // 短词列表 / 百分比
      new ParagraphRule(),  // 兜底
    ]
  }

  classify(segments: TextSegment[]): ClassificationResult[] {
    const results: ClassificationResult[] = []
    const assigned = new Set<number>()  // 已分配段的索引

    for (const rule of this.rules) {
      const ruleResults = rule.match(segments, assigned)
      for (const r of ruleResults) {
        if (!assigned.has(r.segmentIndex)) {
          results.push(r)
          assigned.add(r.segmentIndex)
        }
      }
    }

    // 未匹配到的段落 → paragraphRule 兜底（已包含在 rules 循环中）

    // 后处理：合并相邻同类型的 timeline 条目
    results.sort((a, b) => a.segmentIndex - b.segmentIndex)

    return this.mergeAdjacentTimeline(results, segments)
  }

  private mergeAdjacentTimeline(
    results: ClassificationResult[],
    segments: TextSegment[]
  ): ClassificationResult[] {
    // 合并逻辑：连续的时间线条目（日期 + 标题 + 描述）合并为同一 TimelineBlock
    // 实现见具体代码
    return results
  }
}
```

#### 各 Rule 实现概要

**contactRule.ts — 联系方式识别**
```typescript
// 正则库
const PATTERNS = {
  phone: /1[3-9]\d{1}[-.\s]?\d{4}[-.\s]?\d{4}/g,
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  github: /github\.com\/[a-zA-Z0-9_-]+/i,
  linkedin: /linkedin\.com\/in\/[a-zA-Z0-9_-]+/i,
  website: /https?:\/\/[^\s,，。]+/g,
}

// 也支持 "电话：138xxxx" "邮箱：xxx@xxx.com" 这种 K/V 格式
// 匹配时提取 label 和 value
// 返回 ContactBlock 的 items
```

**timelineRule.ts — 时间线识别**
```typescript
// 日期模式
const DATE_PATTERNS = [
  /(\d{4})[.年/-](\d{1,2})[月/-]?\s*[-–—至到]\s*(\d{4})?[.年/-]?(\d{1,2})?[月]?/,
  /(\d{4})[.年/-](\d{1,2})[月/-]?\s*[-–—至到]\s*(至今|现在|present)/i,
]

// 识别逻辑：
// 1. 找含日期模式的段落
// 2. 日期段后的第一段非日期文本 → 标题（title）
// 3. 标题后的非标题段落（长度 > 20字）→ 描述（description）
// 4. 如果没有描述，只有标题也行
```

**nameRule.ts — 姓名识别**
```typescript
// 姓名特征：
// - 位置在最前（前 3 段内）
// - 纯中文 2-4 字
// - 非长句（ > 6 字阈值）
// - 如果 pdfjs 给字号信息：字号最大（或加粗）

const CHINESE_NAME = /^[一-龥]{2,4}$/
```

**headingRule.ts — 章节标题识别**
```typescript
// "教育经历" "工作经历" "项目经验" "技能" "联系方式" "个人总结" 等
// 特征：
// - 单独成行
// - 短（≤ 20 字）
// - 加粗 或 大字号 或 包含关键词（经历/教育/技能/项目/总结/联系/关于）

const HEADING_KEYWORDS = ['教育', '工作', '项目', '技能', '联系', '个人', '自我', '总结', '实习', '校园', '荣誉', '证书', '语言']
```

**skillRule.ts — 技能识别**
```typescript
// 中等频率的短行，归为技能标签
// 特征：
// - 非标题、非联系方式、非时间线、非姓名
// - 长度 ≤ 15 字
// - 排除已分配给其他规则的段

// 特殊处理：
// 逗号分隔 → 拆成多个标签（如 "Python, Java, TypeScript"）
// 含百分比的 → 拆为 SkillBarBlock（如 "Python 90%"）
```

**paragraphRule.ts — 兜底**
```typescript
// 一切未被上述规则匹配的段落 → 归为 paragraph
// 优先合并相邻的纯文本段落（避免一行一个 ParagraphBlock）
```

#### `ImportReviewModal.tsx`
```
┌─────────────────────────────────────────────────────────────┐
│  导入预览 — 我的简历.pdf                          [✕ 关闭]  │
│  ─────────────────────────────────────────────────────────  │
│  文件解析完成，识别到以下内容。可修改类型、删除条目后确认导入。 │
│                                                             │
│  ┌────┬──────────────┬──────────┬──────────┬──────┐        │
│  │ 序号│ 内容预览      │ 识别类型  │ 将生成    │ 操作  │        │
│  ├────┼──────────────┼──────────┼──────────┼──────┤        │
│  │ 1  │ 张三          │ 姓名      │ 标题块    │ 🗑 ✎  │        │
│  │ 2  │ 13800138000   │ 联系方式  │ 联系方式块 │ 🗑 ✎  │        │
│  │ 3  │ 2020.06-2023 │ 工作经历  │ 时间段块   │ 🗑 ✎  │        │
│  │    │ XX公司 前端.. │           │           │      │        │
│  │ 4  │ 教育经历      │ 章节标题  │ 标题块    │ 🗑 ✎  │        │
│  │ 5  │ 2016.09-2020 │ 教育经历  │ 时间段块   │ 🗑 ✎  │        │
│  │    │ XX大学 计算机  │           │           │      │        │
│  │ 6  │ Python, Java  │ 技能      │ 标签组块   │ 🗑 ✎  │        │
│  └────┴──────────────┴──────────┴──────────┴──────┘        │
│                                                             │
│  [取消]                              [确认导入 (6 个块)]     │
└─────────────────────────────────────────────────────────────┘
```

- 每一行可改类型（下拉选择：标题/正文/时间段/技能条/标签组/联系方式/忽略）
- 每一行可删除（点击 🗑）
- "确认导入" 触发 BlockFactory → store.addBlocks()
- 支持拖拽排序（改顺序）

#### `BlockFactory.ts`
```typescript
// 将 ClassificationResult[] 转为 Block[]
function createBlocks(classifications: ClassificationResult[]): Block[] {
  return classifications
    .filter(c => c.blockType !== 'unknown')
    .map((c, index) => {
      const base = {
        id: nanoid(),
        order: index,
      }
      switch (c.blockType) {
        case 'title':
          return { ...base, type: 'title', content: c.data.text as string, level: 'h1', style: defaultTitleStyle }
        case 'paragraph':
          return { ...base, type: 'paragraph', content: c.data.text as string, style: defaultParagraphStyle }
        case 'timeline':
          return { ...base, type: 'timeline', items: c.data.items as TimelineItem[], style: defaultTimelineStyle }
        case 'tag-group':
          return { ...base, type: 'tag-group', tags: c.data.tags as TagItem[] }
        case 'skill-bar':
          return { ...base, type: 'skill-bar', label: c.data.label as string, level: c.data.level as number, style: defaultSkillBarStyle }
        case 'contact':
          return { ...base, type: 'contact', items: c.data.items as ContactItem[], style: defaultContactStyle }
        case 'divider':
          return { ...base, type: 'divider', style: defaultDividerStyle }
        default:
          return null
      }
    })
    .filter(Boolean) as Block[]
}
```

---

### `components/shared/Toast.tsx` — **新增**
```
┌──────────────────────────────────┐
│  ✅ 成功导入 8 个拼图块           │
└──────────────────────────────────┘
```

- 固定在右上角
- 进场：slideInFromRight 300ms
- 退出：fadeOut 300ms → 2s 后自动消失
- 类型：success / error / info

---

### 组件层详细设计（现有部分不变，仅列出受影响的）

#### `LeftPanel/index.tsx` — **更新**
- 面板下半部分新增 `ImportSection` 组件
- 布局：上方组件库（滚动），下方导入区（固定底部）

#### `App.tsx` — **更新**
- 引入 `Toast` 容器
- 引入 `ImportReviewModal`
- 引入 `useImportStore` 状态控制

### 主题系统详细设计
（不变，同原设计）

### PDF 导出详细设计
（不变，同原设计）

### 撤销/重做机制 — **更新**

```typescript
// 批量导入视为一次操作
function batchAddBlocks(blocks: Block[]) {
  // immer 中一次性 push 所有 blocks
  // undoMiddleware 记录单次快照
  // 一次 Ctrl+Z 全部撤销
}
```

## Error Handling — **更新**

| 场景 | 处理 |
|------|------|
| localStorage 不可用 | 静默降级，数据仅存内存 |
| JSON 导入格式不符 | Toast 错误 + 列出缺失字段 |
| PDF 导出失败 | Toast 错误 + 建议用浏览器打印 |
| 头像过大 | 自动压缩 ≤ 200KB |
| **PDF 无文字层（扫描件）** | Toast 提示"该 PDF 为扫描图片，无法提取文字，请手动创建" |
| **PDF 解析超时（大文件）** | 30s 超时，Toast 提示文件过大 |
| **.doc 旧格式** | 文件选择器只允许 .docx；选择 .doc 时提示转为 .docx |
| **mammoth/pdjs 加载失败** | 首次加载时显示 skeleton，失败则 Toast + 回退按钮 |
| **导入内容全部无法识别** | 全部归入 paragraph block，Toast info "已导入为纯文本块，可手动调整" |
| **导入时 localStorage 满了** | Toast 警告 "存储空间不足，请清理旧简历" |

## Performance — 新增

- **pdfjs-dist (~2MB) 和 mammoth (~500KB) 动态 import 懒加载**
  - 首次点击"导入 PDF"才异步加载 pdfjs-dist
  - 首次点击"导入 Word"才异步加载 mammoth.js
  - 期间按钮显示 spinner
- **解析大文件在主线程外？** pdfjs-dist 自带 worker 线程，mammoth 同步解析但速度够快（<2s for 10页文档）

## Test Plan — **更新**

- **单元测试**（Vitest）：
  - store 的 addBlock/updateBlock/removeBlock/moveBlock + 撤销重做逻辑
  - **新增**：ContentClassifier 每条规则的单元测试（mock 输入，验证分类结果）
  - **新增**：BlockFactory 输入 → 输出正确性
- **组件测试**（React Testing Library）：核心 editor 组件渲染 + 交互
- **新增**：ImportReviewModal 状态测试（切换类型、删除条目、确认）
- **E2E 测试**（可选，手动验证为主）：完整操作流程 + PDF 导出结果 + 导入 PDF/Word 全流程

## Implementation Risks — **更新**

| 风险 | 缓解措施 |
|------|----------|
| @dnd-kit v2 API 变化 | 锁定版本 `^2.0.0` |
| html2canvas 样式差异 | 提供"浏览器打印"降级方案 |
| Tailwind v4 变动 | 锁定 Tailwind v3 |
| **pdfjs-dist 体积大（~2MB）** | dynamic import 懒加载，仅使用时加载 |
| **pdfjs worker 路径问题（Vite）** | 使用 `pdfjs-dist/build/pdf.worker.min.mjs` + `?url` import |
| **mammoth 不保留字号信息** | .docx 走 HTML 解析，保留粗体/标题标记；字号信息缺失但语义够用 |
| **中文简历格式差异大** | 规则从宽匹配 + 预览人工纠错；后续可按规则优先级持续优化 |
| **导入+已有内容冲突** | 导入的 blocks 追加到画布末尾，不覆盖已有内容 |

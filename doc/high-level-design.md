# High-Level Design

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         App Shell                                │
│  ┌──────────┬────────────────────────┬─────────────────────────┐ │
│  │  Left    │     Center              │   Right                 │ │
│  │  Panel   │     Canvas              │   Panel                 │ │
│  │          │                         │                         │ │
│  │ 组件库   │  A4 预览画布            │  属性编辑器             │ │
│  │ ┌──────┐│  ┌─────────────────┐    │                         │ │
│  │ │标题  ││  │                 │    │  选中块的                │ │
│  │ │正文  ││  │  [拖入的块们]   │    │  内容和样式              │ │
│  │ │技能条││  │                 │    │  编辑                    │ │
│  │ │...   ││  │                 │    │                         │ │
│  │ └──────┘│  └─────────────────┘    │                         │ │
│  │ ─────── │                         │                         │ │
│  │ 导入区  │                         │                         │ │
│  │ 📄 PDF  │                         │                         │ │
│  │ 📝 Word │                         │                         │ │
│  └──────────┴────────────────────────┴─────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Bottom Bar: 撤销/重做 · 主题切换 · 导出PDF · JSON导入导出    │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Import Review Modal (弹层)                                   │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  识别结果预览                    [确认导入] [取消]       │ │
│  │  │  ┌──────┬──────────┬─────────────────────┬──────┐      │ │
│  │  │  │ 类型 │ 内容摘要  │ 预计生成块           │ 忽略 │      │ │
│  │  │  ├──────┼──────────┼─────────────────────┼──────┤      │ │
│  │  │  │ 标题 │ 张三     │ → 标题块             │  ✕   │      │ │
│  │  │  │ 联系 │ 138xxx   │ → 联系方式块          │  ✕   │      │ │
│  │  │  │ 时间 │ 2020-... │ → 时间段块(工作)      │  ✕   │      │ │
│  │  │  │ ...  │ ...      │ ...                  │  ✕   │      │ │
│  │  │  └──────┴──────────┴─────────────────────┴──────┘      │ │
│  │  └─────────────────────────────────────────────────────────┘ │
│  └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

## Module Boundaries

### 1. App Shell (`App.tsx`)
- 全局布局（三栏 + 底栏）
- 主题提供者
- 撤销/重做状态管理
- 简历切换管理
- Import Review Modal 状态管理

### 2. 状态管理 (`store/`)
使用 **Zustand**（轻量、高性能、支持 immer 中间件实现不可变更新以配合撤销重做）

```
store/
  useResumeStore.ts    # 核心 store：简历列表、当前简历、block 增删改排序
  useEditorStore.ts    # 编辑器状态：选中块、拖拽状态、面板开关
  useThemeStore.ts     # 主题切换
  useImportStore.ts    # 导入流程状态：解析中/预览/确认 (新增)
```

#### ResumeStore 数据模型
```typescript
interface Resume {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  blocks: Block[]
  themeId: string
}

type Block =
  | TitleBlock
  | ParagraphBlock
  | DividerBlock
  | SkillBarBlock
  | TimelineBlock
  | AvatarBlock
  | TagGroupBlock
  | ContactBlock
  | SpacerBlock

interface BlockBase {
  id: string
  type: BlockType
  order: number
}

interface TitleBlock extends BlockBase {
  type: 'title'
  content: string
  level: 'h1' | 'h2' | 'h3'
  style: { bold: boolean; italic: boolean; underline: boolean; color: string; fontSize: number }
}

interface ParagraphBlock extends BlockBase {
  type: 'paragraph'
  content: string  // markdown string
  style: { color: string; fontSize: number; lineHeight: number }
}

interface DividerBlock extends BlockBase {
  type: 'divider'
  style: { thickness: number; color: string; dash: boolean; marginTop: number; marginBottom: number }
}

interface SkillBarBlock extends BlockBase {
  type: 'skill-bar'
  label: string
  level: number  // 0-100
  style: { color: string; barColor: string; bgColor: string; fontSize: number }
}

interface TimelineBlock extends BlockBase {
  type: 'timeline'
  items: TimelineItem[]
  style: { color: string; fontSize: number; lineColor: string }
}

interface TimelineItem {
  id: string
  dateRange: string
  title: string
  description: string
}

interface AvatarBlock extends BlockBase {
  type: 'avatar'
  imageDataUrl: string | null
  shape: 'circle' | 'square'
  size: number
}

interface TagGroupBlock extends BlockBase {
  type: 'tag-group'
  tags: TagItem[]
}

interface TagItem {
  id: string
  text: string
  color: string
}

interface ContactBlock extends BlockBase {
  type: 'contact'
  items: ContactItem[]
  style: { layout: 'horizontal' | 'vertical'; fontSize: number; color: string }
}

interface ContactItem {
  id: string
  label: string
  value: string
  icon?: string
}

interface SpacerBlock extends BlockBase {
  type: 'spacer'
  height: number
}
```

### 3. 智能导入模块 (`components/Import/`) — **新增**

这是最关键的新模块。整体流程：

```
用户点击 "导入 PDF" 或 "导入 Word"
  → 文件选择器
  → pdfjs-dist / mammoth.js 提取文本
  → ContentClassifier 智能分类
  → ImportReviewModal 展示预览
  → 用户修正/确认
  → BlockFactory 批量生成 block → 插入画布
```

```
Import/
  index.tsx                  # 导入入口（按钮组，可放在 LeftPanel 底部）
  ImportReviewModal.tsx      # 预览确认弹层（核心 UI）
  parsers/
    pdfParser.ts             # pdfjs-dist 封装，提取文本行
    docxParser.ts            # mammoth.js 封装，提取文本 + 语义标记
  classifier/
    ContentClassifier.ts     # 核心分类引擎
    ruleRegistry.ts          # 规则注册表（每条规则：pattern → block type）
    rules/
      nameRule.ts            # 姓名识别
      contactRule.ts         # 联系方式识别（手机/邮箱/URL 正则）
      timelineRule.ts        # 时间线识别（日期范围 + 标题 + 描述）
      skillRule.ts           # 技能识别（短词列表 / 百分比）
      headingRule.ts         # 章节标题识别
      paragraphRule.ts       # 正文（其余的归为正文）
  BlockFactory.ts            # 分类结果 → Block 对象
```

#### ContentClassifier 核心逻辑

```
输入：TextSegment[]  (每段文本 + 元数据：是否加粗、字号、位置)

流程：
1. 预处理：合并连续文本、去空行、去页眉页脚
2. 规则流水线：每条规则依次检查每段文本，返回置信度 + 匹配结果
3. 冲突解决：同一段被多条规则匹配时，选置信度最高的
4. 未匹配段 → 归为 "paragraph"
5. 输出：ClassifiedSegment[] → 传给 ImportReviewModal
```

#### 规则设计

| 规则 | 匹配模式 | 置信度规则 |
|------|---------|-----------|
| **nameRule** | 首段 / 大字号文本 / 2-4个汉字 | high: 首段 + 2-4汉字; medium: 仅首段; low: 仅名字长度 |
| **contactRule** | 手机号(1[3-9]\d{9})、邮箱(regex)、GitHub URL、LinkedIn URL | high: 匹配正则; medium: K/V 对含电话/邮箱关键字 |
| **timelineRule** | "2020.06 - 2023.09" 或 "2020年6月" 模式 + 后续标题行 + 描述段 | high: 日期+标题+描述三要素齐全; medium: 仅日期+文本 |
| **skillRule** | 短文本(≤15字) + 可选百分比 | 仅对非标题、非联系方式的短行触发 |
| **headingRule** | 单独成行 + 短(<20字) + (加粗 或 大字号 或 全英文大写) | high: 满足≥2个条件; medium: 1个 |
| **paragraphRule** | 兜底规则，不匹配以上任何规则的 | 默认 low，作为 fallback |

### 3. 左侧面板 - 组件库 (`components/LeftPanel/`)
```
LeftPanel/
  index.tsx              # 面板容器
  ComponentLibrary.tsx   # 组件库列表 + 搜索
  DraggableBlockItem.tsx # 可拖拽的块项
  ImportSection.tsx      # 导入 PDF/Word 按钮区 (新增)
```

### 4. 中央画布 (`components/Canvas/`)
```
Canvas/
  index.tsx              # 画布容器（A4 比例 + 滚动）
  BlockRenderer.tsx      # 根据 BlockType 渲染对应组件
  SortableBlock.tsx      # 可排序包裹器（@dnd-kit sortable）
```

### 5. 右侧面板 - 属性编辑器 (`components/RightPanel/`)
```
RightPanel/
  index.tsx              # 面板容器
  editors/
    TitleEditor.tsx      # 标题属性编辑
    ParagraphEditor.tsx  # 正文属性编辑
    DividerEditor.tsx    # 分割线属性编辑
    SkillBarEditor.tsx   # 技能条属性编辑
    TimelineEditor.tsx   # 时间段属性编辑
    AvatarEditor.tsx     # 头像属性编辑
    TagGroupEditor.tsx   # 标签组属性编辑
    ContactEditor.tsx    # 联系方式属性编辑
    SpacerEditor.tsx     # 间距属性编辑
    common/
      ColorPicker.tsx    # 通用颜色选择
      FontSizeSlider.tsx # 通用字号滑块
      MarginEditor.tsx   # 通用间距编辑
```

### 6. 底栏 (`components/BottomBar/`)
```
BottomBar/
  index.tsx              # 底栏容器
  UndoRedo.tsx           # 撤销/重做按钮
  ThemeSwitcher.tsx      # 主题切换
  ResumeSwitcher.tsx     # 简历切换 + 新建/删除
  ExportPDF.tsx          # 导出 PDF 按钮
  ImportExport.tsx       # JSON 导入/导出
```

### 7. 共享组件 (`components/shared/`)
```
Button.tsx
Modal.tsx
Dropdown.tsx
Tooltip.tsx
Toast.tsx               # (新增) 导入成功/失败的轻提示
```

### 8. 主题系统 (`themes/`)
```typescript
interface Theme {
  id: string
  name: string
  canvasBg: string
  canvasText: string
  leftPanelBg: string
  rightPanelBg: string
  bottomBarBg: string
  accentColor: string
  blockDefaults: {
    titleColor: string
    textColor: string
    dividerColor: string
    skillBarColor: string
    skillBarBg: string
  }
}
```

预置主题：
- `classic-bw`：经典黑白
- `modern-blue`：现代蓝色
- `minimal-gray`：简约灰白

### 9. 工具层 (`utils/`)
```
exportPdf.ts     # html2canvas + jsPDF，自动隐藏编辑器 chrome
importExport.ts  # JSON 序列化/反序列化
localStorage.ts  # 自动保存/恢复
```

## Data Flow

### 常规编辑流
```
用户操作
  │
  ▼
Zustand Store  ──→ localStorage 自动保存
  │
  ├──→ Canvas 重渲染（受影响的 block 最小化更新）
  ├──→ RightPanel 更新属性表单
  └──→ BottomBar 更新撤销/重做状态
```

### 拖拽流
```
组件库拖拽开始
  → @dnd-kit DragOverlay 显示预览
  → 拖入画布
  → store.addBlock(type, insertIndex)
  → Canvas 渲染新 block
  → 自动选中新 block → RightPanel 显示编辑表单
```

### 智能导入流（新增）
```
用户选择文件 (.pdf 或 .docx)
  → useImportStore.setStatus('parsing')
  → parser 提取文本 → TextSegment[]
  → ContentClassifier 流水线分类 → ClassifiedSegment[]
  → useImportStore.setStatus('review') + 存储结果
  → ImportReviewModal 弹出
  → 用户审查/修改/删除条目
  → 确认
  → BlockFactory 批量生成 blocks
  → store.addBlocks(blocks) 一次性插入
  → useImportStore.reset()
  → Toast "已导入 X 个拼图块"
```

### 导入与撤销/重做的交互
- 批量导入的 blocks 作为一次操作入栈，一次 Ctrl+Z 可全部撤销
- 执行 `store.batchAddBlocks(blocks)` —— 看作一个 undo entry

## Major Design Decisions

1. **Zustand 而非 Redux**：项目规模适中，Zustand 更轻，immer 中间件天然支持不可变数据，便于撤销重做
2. **@dnd-kit 而非 react-beautiful-dnd**：后者不维护了，@dnd-kit 动画更好、TypeScript 支持更好
3. **Tailwind CSS 而非 CSS-in-JS**：主题切换用 CSS 变量 + Tailwind dark mode 变体，性能更好
4. **html2canvas + jsPDF**：纯前端 PDF 方案，无需后端
5. **localStorage 而非 IndexedDB**：数据量小（几个 JSON），localStorage 足够且简单
6. **pdfjs-dist + mammoth.js**：PDF/Word 解析的标准纯前端方案，无需后端
7. **纯启发式规则分类，不用 AI**：隐私安全、离线可用、响应即时；规则引擎可扩展，用户可在预览阶段纠错

## Alternatives Considered

| 决策 | 选了 | 备选 | 为什么没选 |
|------|------|------|------------|
| 状态管理 | Zustand | Redux Toolkit | 过度设计，样板代码多 |
| 拖拽 | @dnd-kit | react-beautiful-dnd | 后者已停止维护 |
| 样式 | Tailwind | styled-components | Tailwind 更快，CSS 变量主题切换更简单 |
| PDF 导出 | html2canvas + jsPDF | Puppeteer | 需要后端，本地使用太重 |
| PDF 解析 | pdfjs-dist | pdf-parse | pdf-parse 需 Node API，浏览器不可用 |
| Word 解析 | mammoth.js | docx.js | mammoth 更成熟，保留粗体/标题语义 |
| 内容分类 | 启发式规则 | LLM API | 隐私安全、免费、离线、即时响应 |
| 富文本 | textarea + markdown | TipTap/Quill | 简历不需要复杂富文本，简单够用 |

## Risks and Unknowns

- **html2canvas 对 CSS 变量 / 高级样式的支持**：导出前做一轮样式内联快照验证，降级方案为浏览器打印
- **localStorage 5MB 限制**：头像图片 base64 可能较大 → 限制头像压缩为 ≤ 200KB
- **@dnd-kit 动画性能**：block 超过 50 个时可能卡顿 → 使用 `useMemo` + `React.memo` 优化
- **PDF 解析准确率**：非标准排版（多栏、表格、扫描件）会降低识别率 → 提供结构化预览界面供用户修正；扫描件 PDF 无文字层时提示用户无法识别
- **mammoth.js 局限性**：仅支持 .docx（Open XML），不支持旧 .doc 格式 → 文件选择器限制 accept=".docx" + 提示用户转换旧格式
- **中文简历格式多样**：不同人的简历排版差异大 → 规则宽松匹配（宁可多匹配，用户可在预览中删改）；持续优化正则覆盖

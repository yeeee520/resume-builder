# v2.0 完成状态

## ✅ 已完成
- 自由布局画布 (absolute positioning + 8向resize)
- 位置尺寸编辑器 (RightPanel X/Y/W/H/ZIndex)
- Kimi Vision AI 导入 PDF
- PDF 导出 oklch 修复

## ⚠️ 已知问题
- Kimi JSON 输出不稳定，已加入多级解析容错，但仍可能失败
- 导入后可进一步优化坐标映射精度

## 🔜 后续优化方向
- 回退到 main 分支: `git checkout main`
- 删除 v2 分支: `git branch -D v2-free-layout`

v1.x 是一个「垂直流式」布局：所有拼图块从上到下排列，通过 @dnd-kit/sortable 排序。
核心局限：块只能是一行宽的条状，无法自由拖拽调整位置和大小。

## v2.0 目标架构

### 1. 核心改动：自由画布（Free Canvas）

```
v1.x:                          v2.0:
┌─────────────────┐            ┌─────────────────┐
│ [标题块]        │            │ [标题]  [头像]   │
│ [正文块]        │            │                  │
│ [技能条]        │            │ [正文] [技能条]  │
│ [时间段]        │            │ [时间段]         │
│ ...             │            │ ...      [间距]  │
│ (自上而下       │            │                  │
│  堆叠排列)      │            │ (自由定位,       │
│                 │            │  任意宽高)       │
└─────────────────┘            └─────────────────┘
```

### 2. 新的 Block 数据模型

每个 Block 增加 position 和 size：

```typescript
interface BlockBase {
  id: string
  type: BlockType
  x: number        // 画布上的水平位置 (px)
  y: number        // 画布上的垂直位置 (px)
  width: number    // 宽度 (px)
  height: number   // 高度 (px)，可 auto
  zIndex: number   // 层级
}
```

layout 模式切换：
- `layoutMode: 'flow'` → v1.0 流式布局（向下兼容）
- `layoutMode: 'free'` → 自由布局

每个 Block 可拖拽移动（左下角有 resize handle）。

### 3. 拖拽系统升级

- 使用 @dnd-kit/core 的 `useDraggable` 替代 `useSortable`（自由画布不需要排序）
- 实现 resize handle：8 个方向的拖拽柄
- 碰撞吸附提示线（alignment guides）

### 4. AI 导入方案

使用 Kimi (Moonshot) Vision API：

```
上传 PDF → pdfjs-dist 每页渲染为图片
         → base64 图片发送给 Kimi Vision
         → Kimi 识别每个内容区块的坐标
         → 同时识别每区块的语义类型
         → 前端裁剪图片为 ImageBlock
         → 覆盖到自由画布上
```

Kimi Vision API:
- endpoint: https://api.moonshot.cn/v1/chat/completions
- model: moonshot-v1-32k (或 vision 系列)
- 输入: base64 图片 + "请识别并分割这张简历图片" prompt
- 输出: JSON 结构化的区块坐标和类型

### 5. PDF 导出彻底修复

- 自由画布下：导出时使用每个 block 的 x/y/w/h 数据直接渲染到 canvas
- 绕开 html2canvas（它不支持 oklch），改用 jsPDF 直接绘制
- 或者：导出前将画布所有 oklch 替换为计算色值（已在 v1 修复中做了 onclone 处理，但还不够彻底）

最简单的可靠方案：
- 用 html2canvas 导出时，预先用 JS 扫描整个 DOM 的 computedStyle，
  把 oklch 值替换为 rgb 等价色
- 包装为 `fixOklchColors()` 函数

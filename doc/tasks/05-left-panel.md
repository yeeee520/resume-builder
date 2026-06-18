# Task: 左侧组件库面板 + 导入入口

## Objective

实现可拖拽组件库列表 + 导入 PDF/Word 按钮区，支持拖入画布或点击添加。

## Input Docs

- doc/detailed-design.md (LeftPanel + ImportSection 部分)

## Expected Files

- `src/components/LeftPanel/index.tsx`（更新）
- `src/components/LeftPanel/ComponentLibrary.tsx`
- `src/components/LeftPanel/DraggableBlockItem.tsx`
- `src/components/LeftPanel/ImportSection.tsx`（新增）

## Dependencies

- 04-app-shell

## Implementation Steps

- [ ] 定义组件库数据：所有 BlockType 的图标（lucide-react）、名称、描述、默认颜色
- [ ] 实现 ComponentLibrary：搜索框 + 分类列表
- [ ] 实现 DraggableBlockItem：@dnd-kit useDraggable，拖拽时显示半透明预览
- [ ] 点击直接添加到画布末尾
- [ ] 拖拽到画布指定位置插入
- [ ] 实现 ImportSection：两个按钮（PDF/Word）+ 文件选择器触发 + 连接 useImportStore
- [ ] 导入按钮处理文件选择 → 调用 parser → 更新 ImportStore → 打开 Modal

## Tests And Checks

- 搜索过滤组件正确
- 点击组件 → 画布末尾新增对应块
- 拖入画布 → 块出现在正确位置
- 动画 60fps
- 点击"导入 PDF" → 文件选择器弹出 → 选文件 → Modal 打开

## Definition Of Done

- [ ] 9 种块类型全部可拖拽/点击添加
- [ ] 搜索过滤工作正常
- [ ] 拖拽动画流畅
- [ ] 导入按钮正确触发流程

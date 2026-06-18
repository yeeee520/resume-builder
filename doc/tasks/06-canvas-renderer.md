# Task: 画布 + 块渲染 + 排序

## Objective

实现中央 A4 画布的块渲染系统、Sortable 拖拽排序、选中高亮。

## Input Docs

- doc/detailed-design.md (Canvas 部分)

## Expected Files

- `src/components/Canvas/index.tsx`（更新）
- `src/components/Canvas/BlockRenderer.tsx`
- `src/components/Canvas/SortableBlock.tsx`
- 各 Block 渲染组件（纯展示，无编辑器）

## Dependencies

- 05-left-panel

## Implementation Steps

- [ ] 实现 A4 画布容器（等比缩放，居中显示，overflow-y auto）
- [ ] 实现 BlockRenderer：根据 block.type 渲染对应展示组件
- [ ] 实现 SortableBlock：@dnd-kit useSortable，包裹每个 block
- [ ] 实现各块的纯展示组件：
  - TitleDisplay：H 标签渲染
  - ParagraphDisplay：markdown 渲染（简单版）
  - DividerDisplay：分割线渲染
  - SkillBarDisplay：标签 + 进度条
  - TimelineDisplay：时间线布局
  - AvatarDisplay：圆形/方形图片
  - TagGroupDisplay：标签组
  - ContactDisplay：联系方式列表
  - SpacerDisplay：空白间距
- [ ] 点击块 → 选中高亮（蓝色边框 + 轻微阴影）
- [ ] 空画布时显示占位提示
- [ ] 拖拽排序动画（@dnd-kit 默认 sensor）

## Tests And Checks

- 添加多个块 → 画布正确渲染
- 拖拽排序 → 块顺序正确变更
- 点击选中 → 高亮 + 右侧面板关联

## Definition Of Done

- [ ] 所有 9 种块在画布上正确渲染
- [ ] 拖拽排序流畅
- [ ] 选中高亮视觉正确
- [ ] 空画布友好提示

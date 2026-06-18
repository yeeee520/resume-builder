# Task: App Shell 布局 + Toast

## Objective

实现三栏 + 底栏的整体布局，共享组件（Button、Modal、Tooltip、Toast），全局快捷键。

## Input Docs

- doc/high-level-design.md (架构图)
- doc/detailed-design.md (模块设计)

## Expected Files

- `src/App.tsx`（重写，含 Toast 容器 + ImportReviewModal 挂载点）
- `src/components/LeftPanel/index.tsx`
- `src/components/Canvas/index.tsx`
- `src/components/RightPanel/index.tsx`
- `src/components/BottomBar/index.tsx`
- `src/components/shared/Button.tsx`
- `src/components/shared/Modal.tsx`
- `src/components/shared/Tooltip.tsx`
- `src/components/shared/Toast.tsx`（新增）

## Dependencies

- 01-scaffold
- 02-state-management
- 03-theme-system

## Implementation Steps

- [ ] 实现 App.tsx 三栏布局（flex row），左右面板可折叠
- [ ] 实现 LeftPanel 骨架：标题 + 折叠按钮
- [ ] 实现 Canvas 骨架：A4 比例容器，白色背景 + 阴影
- [ ] 实现 RightPanel 骨架：标题 + 空状态提示
- [ ] 实现 BottomBar 骨架：横向按钮组
- [ ] 实现 shared 组件（Button、Modal、Tooltip）
- [ ] 实现 Toast 组件：success/error/info + 动画 + 自动消失
- [ ] 全局快捷键监听：Ctrl+Z / Ctrl+Y

## Tests And Checks

- `npm run dev` → 三栏布局正确显示
- 折叠/展开左右面板动画流畅
- A4 画布比例正确
- Ctrl+Z / Ctrl+Y 触发 undo/redo
- Toast 弹出/消失正常

## Definition Of Done

- [ ] 布局完整，三栏比例合适
- [ ] 面板可折叠，动画流畅 200ms
- [ ] 快捷键正常工作
- [ ] 主题色在布局中正确应用
- [ ] Toast 三种类型展示正确

# Task: 拖拽交互完善与性能优化

## Objective

完善跨面板拖拽（组件库 → 画布）的交互体验，优化大数量 block 下的渲染性能，确保动画流畅 60fps。

## Input Docs

- doc/detailed-design.md

## Expected Files

- 涉及之前所有 Canvas/LeftPanel 组件

## Dependencies

- 08-bottom-bar（所有功能完成后做性能优化）

## Implementation Steps

- [ ] 实现组件库到画布的跨容器拖拽（@dnd-kit DndContext 统一管理）
- [ ] 拖入时计算插入位置（closest center / sortable 自动处理）
- [ ] DragOverlay 定制预览（半透明 + 缩小 + 蓝色边框）
- [ ] 性能优化：
  - Canvas 中 block 展示组件使用 `React.memo`
  - `useMemo` 缓存排序后的 block 列表
  - 拖拽时使用 `transform` 动画（GPU 加速）
  - 避免拖拽时触发不必要的重渲染
- [ ] 边界情况：
  - 画布无 block 时的空状态拖入
  - 拖出画布区域取消
  - 重复快速拖入
- [ ] 动画微调：缩放、阴影、easing

## Tests And Checks

- 拖入 50 个 block → 排序仍然流畅
- Chrome DevTools Performance 录制 → 无 long task (>50ms)
- React DevTools Profiler → 无多余重渲染

## Definition Of Done

- [ ] 跨容器拖拽流畅
- [ ] 50 个 block 下操作不卡顿
- [ ] 动画 60fps
- [ ] 无性能警告

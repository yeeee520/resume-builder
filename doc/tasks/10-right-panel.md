# Task: 右侧属性编辑器

## Objective

实现选中块的属性编辑器，每种块类型对应独立的编辑表单，支持内容和样式编辑。

## Input Docs

- doc/detailed-design.md (RightPanel + editors 部分)

## Expected Files

- `src/components/RightPanel/index.tsx`（更新）
- `src/components/RightPanel/editors/TitleEditor.tsx`
- `src/components/RightPanel/editors/ParagraphEditor.tsx`
- `src/components/RightPanel/editors/DividerEditor.tsx`
- `src/components/RightPanel/editors/SkillBarEditor.tsx`
- `src/components/RightPanel/editors/TimelineEditor.tsx`
- `src/components/RightPanel/editors/AvatarEditor.tsx`
- `src/components/RightPanel/editors/TagGroupEditor.tsx`
- `src/components/RightPanel/editors/ContactEditor.tsx`
- `src/components/RightPanel/editors/SpacerEditor.tsx`

## Dependencies

- 09-canvas-renderer

## Implementation Steps

- [ ] 更新 RightPanel index：根据 selectedBlockId 获取 block，动态渲染对应 editor
- [ ] 实现各 Editor 组件，统一模式：
  - 内容编辑区在上
  - 样式编辑区在下（折叠面板）
  - 底部：删除块 + 复制块按钮
- [ ] 实现通用编辑控件（内联）：
  - ColorPicker：颜色选择器（预设色板 + 自定义）
  - FontSizeSlider：字号滑块（10-48px）
  - MarginEditor：间距上下左右
- [ ] 各编辑器：
  - TitleEditor：文本输入 + 级别选择 + 加粗/斜体/下划线 + 颜色/字号
  - ParagraphEditor：textarea + 颜色/字号/行高
  - DividerEditor：粗细/颜色/虚线/上下间距
  - SkillBarEditor：标签名 + 滑块 0-100 + 颜色
  - TimelineEditor：添加/删除/排序条目（日期 + 标题 + 描述）
  - AvatarEditor：上传 + 压缩 + 形状切换
  - TagGroupEditor：添加/删除/改色标签
  - ContactEditor：添加/删除 K/V 对 + 布局切换
  - SpacerEditor：高度滑块
- [ ] 编辑时自动触发 store.updateBlock → 画布实时更新

## Tests And Checks

- 选中每种类型的块 → 右侧显示对应编辑器
- 修改内容 → 画布实时更新
- 删除块 → 画布移除 + 右侧恢复空状态
- 复制块 → 画布新增副本
- 头像上传压缩正确

## Definition Of Done

- [ ] 9 种编辑器全部实现
- [ ] 编辑内容画布实时同步
- [ ] 删除/复制功能正常
- [ ] 样式编辑器折叠/展开正常

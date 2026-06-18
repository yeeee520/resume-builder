# Task: 主题系统

## Objective

实现三套主题（经典黑白、现代蓝色、简约灰白）的 CSS 变量定义，主题切换时可实时全局应用。

## Input Docs

- doc/detailed-design.md (主题系统部分)

## Expected Files

- `src/themes/index.ts`

## Dependencies

- 02-state-management

## Implementation Steps

- [ ] 定义 `Theme` 接口和 `ThemeVars` 类型
- [ ] 实现三套主题变量
- [ ] 注入函数：遍历 vars 设置到 `document.documentElement.style`
- [ ] 配合 useThemeStore 实现切换

## Tests And Checks

Dev 模式下切换主题，检查浏览器 DevTools 中 `:root` 的 CSS 变量变化

## Definition Of Done

- [ ] 三套主题定义完整
- [ ] 切换主题时全局样式实时更新
- [ ] Canvas、面板、按钮等基础元素响应主题变化

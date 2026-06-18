# Progress

## Current Status

✅ **v1.1 完成 — 4 个 Bug 已修复**

### 修复内容
1. **导入 PDF/Word 报错** → 正则表达式加 `g` flag（matchAll 要求全局正则）
2. **全屏 UI 偏小** → 全局字号从 10px → 11px，body 基础字号 15px
3. **画布有滚动条** → Canvas 容器改为 `overflow-hidden`，画布采用 `aspectRatio` 比例自适应，内部 content 滚动
4. **PDF 导出无反应** → 修正 jsPDF 导入方式（`jsPDFModule.jsPDF`），加错误日志

## Tasks

- [x] 01-scaffold - 项目脚手架搭建
- [x] 02-state-management - 数据模型与状态管理
- [x] 03-theme-system - 主题系统
- [x] 04-app-shell - App Shell 布局 + Toast
- [x] 05-left-panel - 左侧组件库面板 + 导入入口
- [x] 06-import-parsers - 智能导入解析器
- [x] 07-import-classifier - 智能导入分类器
- [x] 08-import-review-modal - 导入预览弹窗
- [x] 09-canvas-renderer - 画布 + 块渲染 + 排序
- [x] 10-right-panel - 右侧属性编辑器
- [x] 11-bottom-bar - 底栏功能
- [x] 12-dnd-polish - 拖拽交互完善
- [x] 13-final-polish - 收尾完善
- [x] 14-bug-fix - 4个问题修复（matchAll/regex、UI字号、画布滚动条、PDF导出）

## Commands Run

_待实现_

## Decisions

- 技术栈：React 18 + TypeScript + Vite + Tailwind CSS + Zustand + @dnd-kit + html2canvas + jsPDF
- PDF 解析：pdfjs-dist（纯前端，懒加载 ~2MB）
- Word 解析：mammoth.js（纯前端，懒加载 ~500KB）
- 内容分类：纯启发式规则引擎（6 条规则管线），不用 AI/LLM
- 数据持久化：localStorage + JSON 导出/导入
- 主题：3 套
- 导入作为单次撤销操作（addBlocks 方法）

## Blockers

_无_

## Next Steps

开始实现 01-scaffold（项目脚手架搭建）

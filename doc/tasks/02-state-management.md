# Task: 数据模型与状态管理（含导入 Store）

## Objective

实现 Zustand Store，包含所有类型定义（含导入相关类型）、ResumeStore（CRUD + 排序 + 撤销重做 + 批量添加）、EditorStore、ThemeStore、ImportStore，以及 localStorage 持久化。

## Input Docs

- doc/high-level-design.md
- doc/detailed-design.md

## Expected Files

- `src/store/types.ts`（含 ImportState, TextSegment, ClassifiedSegment, ClassificationResult 等导入类型）
- `src/store/useResumeStore.ts`（新增 `addBlocks()` 批量方法）
- `src/store/useEditorStore.ts`
- `src/store/useThemeStore.ts`
- `src/store/useImportStore.ts`（新增：状态机 idle→parsing→reviewing→importing→done）
- `src/utils/localStorage.ts`

## Dependencies

- 01-scaffold

## Implementation Steps

- [ ] 编写 `types.ts`：所有 Block 类型 + Resume + Theme + EditorState + ImportState + ImportStatus + TextSegment + ClassifiedSegment + ClassificationResult
- [ ] 编写 `useResumeStore.ts`：核心 CRUD + addBlocks(批量) + immer 中间件 + undo/redo + persist
- [ ] 编写 `useEditorStore.ts`：selectedBlockId、面板开关状态
- [ ] 编写 `useThemeStore.ts`：主题切换 + CSS 变量注入 + persist
- [ ] 编写 `useImportStore.ts`：状态机 + actions (startParse, setReview, confirm, reset, setError)
- [ ] 编写 `utils/localStorage.ts`：封装 get/set/remove，含错误降级

## Tests And Checks

手动验证：console 中调用 store 方法，确认数据更新
ImportStore 状态机流转验证

## Definition Of Done

- [ ] 所有类型导出正确，含导入相关类型
- [ ] Store 方法工作正常
- [ ] addBlocks 作为单次撤销操作
- [ ] 撤销/重做逻辑正确
- [ ] localStorage 持久化 + 降级策略
- [ ] 主题切换 CSS 变量正确注入
- [ ] ImportStore 状态机流转正确

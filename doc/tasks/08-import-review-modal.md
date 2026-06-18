# Task: 智能导入模块 — ImportReviewModal

## Objective

实现导入预览确认弹层，展示分类结果，支持用户修改类型/删除条目/确认导入。

## Input Docs

- doc/detailed-design.md (ImportReviewModal 详细设计)

## Expected Files

- `src/components/Import/ImportReviewModal.tsx`

## Dependencies

- 07-import-classifier（分类器和 BlockFactory）
- 04-app-shell（Modal 组件）

## Implementation Steps

- [ ] 实现 ImportReviewModal 布局：
  - 顶部标题 + 文件名 + 统计（"识别到 X 条内容"）
  - 表格：序号 + 内容预览 + 识别类型（下拉可改）+ 将生成块类型 + 删除按钮
  - 底部：[取消] [确认导入 (N 个块)]
- [ ] 类型下拉选项：标题/正文/时间段(工作)/时间段(教育)/技能条/标签组/联系方式/分割线/忽略
- [ ] 删除条目：从列表中移除
- [ ] 确认按钮：
  - 过滤掉"忽略"类型的条目
  - 调用 BlockFactory.createBlocks()
  - 调用 store.addBlocks()
  - 关闭 Modal + Toast 成功
- [ ] 空结果处理："未能识别到有效内容，是否全部作为正文导入？"
- [ ] 与 useImportStore 联动

## Tests And Checks

- 打开 Modal → 展示分类结果列表
- 修改某条类型 → 实时更新
- 删除某条 → 从列表消失
- 确认 → 画布出现对应 blocks
- 全部忽略 → Toast 提示无导入

## Definition Of Done

- [ ] 预览表格展示完整
- [ ] 类型可修改
- [ ] 条目可删除
- [ ] 确认导入正确生成 blocks
- [ ] 错误/空状态处理

# Task: 收尾完善

## Objective

最终验证、修复小问题、完善细节、生成 .bat 启动脚本确认。

## Input Docs

- All previous tasks

## Expected Files

- `启动简历编辑器.bat`（确认）

## Dependencies

- 09-dnd-polish

## Implementation Steps

- [ ] 确认 `启动简历编辑器.bat` 内容正确：`start http://localhost:5173 && npm run dev`
- [ ] 全流程走一遍：新建简历 → 添加各种块 → 编辑 → 排序 → 换主题 → 导出 PDF → 导出 JSON → 新建简历导入
- [ ] 检查边界情况：空画布、块全删、头像过大、localStorage 清除后
- [ ] 添加 favicon
- [ ] 确保 `npm run build` 无报错，产物可部署
- [ ] 清理 console.log / 调试代码
- [ ] 确认 README（可选）

## Tests And Checks

- 完整操作流程无报错
- PDF 导出内容与预览一致
- localStorage 清除后默认状态友好
- build 产物完整

## Definition Of Done

- [ ] 全流程通过
- [ ] build 成功
- [ ] .bat 一键启动正常

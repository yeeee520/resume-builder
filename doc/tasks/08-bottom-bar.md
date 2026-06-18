# Task: 底栏功能（撤销/重做/主题/简历切换/导入导出/PDF）

## Objective

实现底栏全部功能按钮：撤销、重做、主题切换、简历管理、JSON 导入导出、PDF 导出。

## Input Docs

- doc/detailed-design.md (BottomBar 各部分)

## Expected Files

- `src/components/BottomBar/index.tsx`（更新）
- `src/components/BottomBar/UndoRedo.tsx`
- `src/components/BottomBar/ThemeSwitcher.tsx`
- `src/components/BottomBar/ResumeSwitcher.tsx`
- `src/components/BottomBar/ExportPDF.tsx`
- `src/components/BottomBar/ImportExport.tsx`
- `src/utils/exportPdf.ts`
- `src/utils/importExport.ts`

## Dependencies

- 07-right-panel

## Implementation Steps

- [ ] 实现 UndoRedo：按钮 + 快捷键 badge 提示 + disabled 状态
- [ ] 实现 ThemeSwitcher：下拉菜单，主题名 + 色块预览，切换时即时生效
- [ ] 实现 ResumeSwitcher：下拉选简历 + 新建（Modal 输入名）+ 删除
- [ ] 实现 ImportExport：导出 JSON（download blob）、导入 JSON（file input → 验证 → 新建简历）
- [ ] 实现 ExportPDF：
  - html2canvas 截取画布（隐藏编辑器 UI）
  - jsPDF 生成 A4 PDF
  - 自动分页（内容超过一页时）
  - Loading 状态 + Toast 提示
- [ ] 底栏毛玻璃背景效果 (backdrop-blur)

## Tests And Checks

- 撤销/重做：添加几个块 → Ctrl+Z 回退 → Ctrl+Y 重做
- 主题切换：三个主题都能正常切换
- 简历切换：新建多份简历 → 切换 → 各份独立
- JSON 导出 → 删除当前简历 → 导入 JSON → 恢复
- PDF 导出 → 打开 PDF 核对内容

## Definition Of Done

- [ ] 撤销/重做正确，最多 50 步
- [ ] 主题即时切换
- [ ] 多简历创建/切换/删除
- [ ] JSON 导出/导入数据完整
- [ ] PDF 导出内容正确、格式为 A4

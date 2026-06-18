# Task: 智能导入模块 — 解析器

## Objective

实现 PDF 和 Word (.docx) 的文本提取解析器，输出统一的 TextSegment 格式供分类器使用。

## Input Docs

- doc/detailed-design.md (智能导入部分)

## Expected Files

- `src/components/Import/parsers/pdfParser.ts`
- `src/components/Import/parsers/docxParser.ts`

## Dependencies

- 04-app-shell

## Implementation Steps

- [ ] 实现 pdfParser.ts：
  - dynamic import pdfjs-dist
  - 配置 worker（使用 pdfjs-dist/build/pdf.worker.min.mjs + Vite `?url`）
  - 提取每页文本、坐标、字号、页号
  - 按 page → y 排序
  - 输出 ParsedTextSegment[]
- [ ] 实现 docxParser.ts：
  - dynamic import mammoth
  - 使用 mammoth.convertToHtml() 保留语义标记
  - DOMParser 解析 HTML，提取 h1/h2/h3/strong/li/普通段落
  - 输出 DocxParsedSegment[]
- [ ] 两个 parser 都封装为统一接口：`parseFile(file: File): Promise<TextSegment[]>`
- [ ] 错误处理：扫描件 PDF（无文字）检测、超时处理

## Tests And Checks

- 准备一份测试 PDF 简历 → 验证提取出文字
- 准备一份测试 Word 简历 → 验证提取出文字 + 识别粗体/标题
- 扫描件 PDF → 正确报错
- 大文件 → 不阻塞 UI

## Definition Of Done

- [ ] PDF 解析正确输出 TextSegment[]
- [ ] Word 解析正确输出 TextSegment[]（含语义标记）
- [ ] 扫描件 PDF 给出友好错误
- [ ] 懒加载不阻塞首屏

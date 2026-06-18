# Task: 项目脚手架搭建

## Objective

初始化 React + TypeScript + Vite 项目，配置 Tailwind CSS、Zustand、@dnd-kit 等依赖，包含 pdfjs-dist 和 mammoth.js。

## Input Docs

- doc/proposal.md
- doc/high-level-design.md
- doc/detailed-design.md

## Expected Files

- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `tailwind.config.js`
- `postcss.config.js`
- `index.html`
- `src/main.tsx`
- `src/App.tsx`
- `src/index.css`
- `启动简历编辑器.bat`

## Dependencies

无

## Implementation Steps

- [ ] `npm create vite@latest . -- --template react-ts` 初始化
- [ ] 安装依赖：tailwindcss, postcss, autoprefixer, zustand, immer, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, html2canvas, jspdf, pdfjs-dist, mammoth, lucide-react, nanoid
- [ ] 配置 Tailwind CSS（CSS 变量方案 + 主题色）
- [ ] 配置 Vite（路径别名 @/ → src/，pdfjs worker 配置）
- [ ] 创建基础 App.tsx（三栏布局骨架）
- [ ] 创建 index.css（CSS 变量定义 + Tailwind 基础层）
- [ ] 编写 `启动简历编辑器.bat`：`start http://localhost:5173 && npm run dev`

## Tests And Checks

```bash
npm run dev      # 确认 Vite 启动成功
npm run build    # 确认构建成功
```

## Definition Of Done

- [ ] `npm run dev` 启动，浏览器看到三栏布局
- [ ] `npm run build` 无报错
- [ ] 双击 .bat 自动打开浏览器
- [ ] pdfjs-dist 和 mammoth 在 package.json 中

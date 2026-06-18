@echo off
chcp 65001 >nul
echo 🚀 正在启动简历拼图构建器...
echo.
echo 首次使用请先运行: npm install
echo.
start http://localhost:5173
npm run dev
pause

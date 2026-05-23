# 简休 EyeRest

轻量级桌面护眼休息助手 —— 通过定时提醒和护眼操引导，帮助长时间面对电脑的用户缓解视觉疲劳。

## 技术栈

- **框架**: Electron + Vue 3 + TypeScript
- **样式**: Tailwind CSS
- **构建**: electron-vite + electron-builder
- **架构**: MTC 单进程模式（主进程常驻 ~20-30MB，渲染进程按需创建用完即销毁）

## 快速开始

```bash
git clone https://github.com/H7-kero/eyerest.git
cd eyerest
npm install
npm run dev
```

## 功能

- 定时主动提醒（弹窗/全屏/通知/声音）
- 护眼操引导（4 种动画：远近焦距/眼球转动/眨眼/深呼吸）
- 休息数据统计（日/周/月）
- 系统托盘（三色图标 + 悬浮提示 + 右键菜单）
- 设置面板（3 Tab + 实时预览）

## 打包

```bash
npm run dist:mac    # macOS
npm run dist:win    # Windows
npm run dist:linux  # Linux
```
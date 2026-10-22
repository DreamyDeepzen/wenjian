# 轻问卷 · 问卷收集平台

一个纯静态的问卷网站：创建问卷 → 复制公开填写链接发给别人 → 提交结果自动发送到邮箱（Formspree）。

- 技术栈：React + TypeScript + Vite + Tailwind CSS
- 路由：Hash 模式（适合静态托管，刷新不 404）
- 问卷数据通过 base64 编码嵌入分享链接，无需后端数据库

## 本地开发

```bash
npm install
npm run dev
```

## 部署

推送到 `main` 分支后，GitHub Actions 会自动构建 `dist/` 并发布到 GitHub Pages。

部署前需要在仓库 **Settings → Pages → Source** 选择 **GitHub Actions**。

## 使用说明

1. 打开网站 →「接收设置」填入你的 Formspree 表单 ID（结果将发送到你的邮箱）
2. 「新建问卷」创建题目
3. 「结果」页复制公开填写链接，发给需要填写的人

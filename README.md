# 个人博客

Astro 静态博客 + Sveltia CMS 后台。前台和后台都在 Cloudflare Pages 上，内容以 Markdown 存在 GitHub 仓库，全程零服务器、零费用。

## 目录说明

| 路径 | 作用 |
|---|---|
| `src/content/posts/` | 文章（Markdown） |
| `src/content/pages/` | 关于页 |
| `public/admin/` | 后台入口与配置 |
| `public/images/uploads/` | 后台上传的图片 |
| `src/consts.ts` | 站点名称、描述、网址 |

## 首次上线

1. GitHub 仓库 `zh-simon/wordfo-blog`（已完成）
2. Cloudflare 面板 → Workers & Pages → Create → Pages → Connect to Git
3. 选仓库 `zh-simon/wordfo-blog`，构建命令 `npm run build`，输出目录 `dist`
5. 打开 `https://wordfo.pages.dev` 看前台，加 `/admin` 看后台
6. 按下节生成 GitHub 令牌，粘贴到 `/admin` 登录页

## 生成 GitHub 令牌

1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Generate new token：名称随意，过期时间建议 90 天
3. Repository access → Only select repositories → 只勾 `wordfo-blog`
4. Permissions → Repository permissions → **Contents: Read and write**（Metadata 只读会自动带上）
5. Generate token，复制保存
6. 打开 `/admin`，选「Sign In Using Access Token」，粘贴登录

令牌只存在你当前浏览器的 localStorage 里，不经服务器。泄露了就在 GitHub 撤销，影响范围只有这一个仓库。

## 日常写稿

1. 打开 `/admin`，粘贴令牌登录（一台电脑只需一次）
2. 左侧「文章」→「新建文章」→ 填标题、摘要、日期、标签、正文 → 保存
3. 约一分钟后前台更新

勾选「草稿」字段的文章保存后不会出现在前台。

## 改站点信息

改 `src/consts.ts` 里的 `SITE_TITLE`、`SITE_DESCRIPTION`、`SITE_URL`，提交后自动部署。绑定自定义域名后同步改 `SITE_URL`。

## 本地开发

```bash
npm install
npm run dev
```

本地后台地址是 `http://localhost:4321/admin/index.html`（注意要带 `index.html`）。

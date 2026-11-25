---
title: 你好，世界
description: 博客上线了，记录一下这套零成本的前后台方案。
pubDate: 2026-11-25
tags:
  - 随笔
draft: false
---

这是第一篇文章，由博客后台创建。

## 这套博客怎么用

前台是 Astro 生成的静态页面，托管在 Cloudflare Pages；后台是 Sveltia CMS，打开站点后的 `/admin` 就能写文章。

写作流程只有三步：

1. 打开 `/admin`，用 GitHub 令牌登录
2. 点「新建文章」，填标题、摘要、标签，写正文
3. 点「保存」——文章自动提交到 GitHub，Cloudflare 自动重新构建，一分钟左右上线

## 图片

在文章里直接粘贴或拖拽图片即可，图片会上传到仓库的 `public/images/uploads/`，跟文章一起发布。

## 数据在哪

所有文章都是 GitHub 仓库里的 Markdown 文件。即使哪天不用这套系统了，内容仍然完整地躺在你的仓库里。

![示例图片](/images/uploads/sample.svg)

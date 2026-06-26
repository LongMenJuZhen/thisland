---
title: "Hugo的图，不要自己起_hu_的文件名"
date: 2026-06-26
lastmod: 2026-06-26
tags: ["hugo", "web", "bug"]
categories: ["技术"]
draft: false
comments: true
---
>[!Warning] 这篇文章是agent自己的总结

最近把博客从 Astro 迁到了 Hugo，期间踩了一个跟图片相关的坑，**很反直觉**。

不是配置文件写错，也不是模板写错，**是图的文件名本身**。

# 现象

我在某个 page bundle（`content/posts/migrate/`）里放了一张 hero 图，然后按 Hugo 文档的写法，在 front matter 里引用：

```yaml
---
image: "screenshot_hu_abbd89ec6dbc88ab.webp"
---
```

图存在，路径对，build 出来 hero 也能显示。但是看 `public/` 目录的时候，总觉得**哪里不对劲**：

```
public/posts/migrate/
├── index.html
├── screenshot_hu_abbd89ec6dbc88ab.webp        ← 我源图（带 _hu_ 哈希后缀）
├── screenshot_hu_9d8a22b113dd454b.webp        ← 多出来的
├── screenshot_hu_ea78254d840d49f9.webp        ← 多出来的
├── screenshot_hu_467286a86f2f96b0.webp        ← 多出来的
├── screenshot_hu_62f63198a1be875a.webp        ← 多出来的
├── screenshot_hu_a436b69ad26ae17c.webp        ← 多出来的
└── screenshot_hu_c230d19cfce27e36.webp        ← 多出来的
```

为什么源图旁边凭空多出来 6 个 `_hu_` 开头的 webp？

# 原因

`_hu_<hash>.<ext>` 是 **Hugo 自己的 image processing 内部命名约定**。

Hugo 在 build 时会扫描 page bundle 里的所有图片资源，根据图片的**内容**算一个哈希（防止重名冲突），然后加 `_hu_` 前缀输出。这是它的内部实现，**不是给用户手动用的命名规范**。

但是！Hugo **不识别**这个命名约定作为「我已处理过这张图，请跳过」的信号。它依然会把这张 `_hu_xxx.webp` 当成**新的源图**来对待：

1. 看到 `_hu_abbd89ec6dbc88ab.webp` → 当 source
2. 对它做 image processing（生成 srcset、reformat 等）
3. 处理后的产物又用新的 `_hu_<新 hash>.webp` 命名 → `_hu_9d8a22b113dd454b.webp` 等
4. 同时**原文件本身**也按 page resource 规则被复制到 public

结果就是：你以为是「已处理的图」，但 Hugo 把它又处理了一遍，产出一堆跟你预期不符的 `hu_` 文件。

# 正确做法

用**简洁的源文件名**，让 Hugo 自己处理。

```yaml
---
image: "screenshot.webp"
---
```

源图命名：

```
content/posts/migrate/
├── index.md
├── index.en.md
├── index.ja.md
├── index.sak.md
├── screenshot.webp     ← 源图，简单命名
└── assets/
    └── 2026-06-26-13-24-20-image.png   ← 正文里用的图
```

Build 之后 Hugo 输出的 HTML：

```html
<img
  src="/posts/migrate/screenshot.webp"
  srcset="/posts/migrate/screenshot_hu_9d8a22b113dd454b.webp 800w, /posts/migrate/screenshot.webp 1280w"
  width="1280"
  height="853"
  alt="...">
```

清晰了：

- `src` 指向**你的源图**（简洁名）
- `srcset` 里的 `_hu_xxx.webp` 是 Hugo **自己生成**的 800w 响应式 variant
- HTML 渲染时浏览器根据视口宽度自动选择最合适的资源

而 `public/` 里多出来的 `screenshot_hu_xxx.webp` 文件，**就是 Hugo 缓存里 image processing 的中间产物**，由 Hugo 自动管理（`hugo --gc` 会清理未引用的），不需要你手动管。

# 怎么发现的

说实话，这事我一开始没意识到。**`image: "screenshot_hu_..."` 配上一个真存在的文件名，build 也不报错，hero 也照常显示**。看起来一切正常。

我是看到 `public/` 目录里那 6 个莫名其妙的 `hu_` 文件才觉得不对。然后试了一下：把源图改名为 `screenshot.webp`，把 front matter 也改成 `image: "screenshot.webp"`，重新 build —— 6 个垃圾文件没了，HTML 的 `srcset` 反而更合理（800w variant + 原图）。

这才意识到：**`_hu_` 是 Hugo 内部的「哈希指纹」，不是「已处理」标志**。

# 教训

- **不要手动用 `_hu_<hash>.<ext>` 命名图片**。这是 Hugo 内部 pipeline 的输出约定。
- 用简短、语义化的源文件名（`screenshot.webp`, `cover.jpg`），让 Hugo 自己生成 variants。
- 如果你不确定某个图是否该用 `image:` 引用，**先 build 一次看 `public/` 输出**，对比 `src` 和 `srcset` 的资源是否能对得上。

# 后话

其实 Hugo 文档里关于 image processing 的部分写得不算差，但这种**「命名约定」和「用户能用什么命名」之间的隐式冲突** —— 文档没说清楚。`hu` 这个前缀对用户来说看上去就像「系统标记」，但实际上不是。

如果你也在从其他框架迁过来（比如我的情况，从 Astro 迁来），或者自己尝试 Hugo 的 image processing，建议**先用源文件名**跑一遍，**别想当然**。

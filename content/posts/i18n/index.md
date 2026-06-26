---
title: AI帮我把博客国际化了（完整记录）
date: 2026-05-19
lastmod: 2026-05-19

tags: [astro,i18n,AI,国际化]
categories: ["技术"]
draft: false
---

# 前言

话说最近 AI 编程助手是真的好用啊。这不，我就让 AI 帮我把这个博客改造成了多语言支持的。

事情是这样的：某天我刷到 Astro 官方出了一个国际化（i18n）的教程，然后就寻思着要不给我的博客也整一个？毕竟虽然我写的都是中文，但万一哪天有个歪果仁想看看呢？

然后我就对着 AI 一顿输出，让它参考官方文档帮我实现。中间当然踩了不少坑，但最后还真搞出来了。

# 为什么需要国际化

个人博客做国际化听起来有点多余，毕竟我写的都是中文。但如果细想一下，其实还是有一些价值的：

1. **国际化博客 ≠ 写英文内容**：你可以只写中文，但给歪果仁一个"这里有个中文博客"的入口
2. **技术文章的价值**：程序员写技术文章，有时候歪果仁比同胞更愿意看（毕竟英文技术博客太多了）
3. **SEO 友好**：Google 可以更好地索引不同语言的内容
4. **练练手**：趁这个机会学习一下 Astro 的 i18n 机制

# Astro 国际化核心概念

在动手之前，先来了解一下 Astro 的 i18n 相关概念。

## 路由层面的 i18n vs 内容层面的 i18n

Astro 的国际化其实分两个层面：

### 路由 i18n（astro.config.mjs）

这是 URL 层面的多语言支持。比如：
- `/` → 默认语言（中文）
- `/en/` → 英文
- `/ja/` → 日文

在 `astro.config.mjs` 中配置：

```javascript
i18n: {
    locales: ["zh-cn", "en", "ja"],
    defaultLocale: "zh-cn",
    prefixDefaultLocale: false,  // 默认语言不加前缀
    redirectToDefaultLocale: true,  // 访问 / 重定向到 /zh-cn/
}
```

关键参数解释：
- `locales`：支持的语种列表，使用 BCP 47 标准格式
- `defaultLocale`：默认语言
- `prefixDefaultLocale: false`：默认语言不带前缀，`/posts/xxx/`；其他语言带前缀，`/en/posts/xxx/`
- `redirectToDefaultLocale: true`：访问根路径时自动跳转到默认语言首页

### 内容 i18n（Content Collections）

这是文章内容的国际化。Astro 官方给了两种方案：

**方案一：frontmatter 加 lang 字段**
```yaml
---
title: 我的文章
lang: en
---
```

所有语言的文章放同一个目录，通过 `lang` 字段区分。

**方案二：子目录结构**
```
src/content/posts/
├── zh/           # 中文文章
│   ├── post1.md
│   └── post2.md
├── en/            # 英文文章
│   └── post1.md   # post1 的英文版
└── ja/            # 日文文章
    └── post1.md
```

## 为什么我选方案二

一开始 AI 推荐的是方案一（frontmatter 加 lang 字段），因为实现起来更简单。但我最后还是选了方案二，原因是：

1. **slug 独立**：方案一中不同语言的文章共用 slug，方案二可以独立命名
2. **内容差异大时更灵活**：如果中英文内容差异很大（这是很常见的），独立文件更方便管理
3. **避免冲突**：如果某篇文章只有中文没有英文，方案一会很尴尬

## Astro.currentLocale vs 路由前缀

在 Astro 模板中，你可以通过 `Astro.currentLocale` 获取当前页面的语言：

```astro
---
const locale = Astro.currentLocale; // 返回 "zh-cn", "en", 或 "ja"
---
```

但要注意：**`Astro.currentLocale` 只能告诉你当前路由的语言，不能直接用来过滤内容**。为什么？因为 Astro 的 `getStaticPaths` 默认不传 locale 参数给 filter 函数。

# 核心改动详解

## 1. 目录结构重组

把文章按语言分到不同子目录：

```bash
src/content/posts/zh/   # 中文
src/content/posts/en/   # 英文  
src/content/posts/ja/   # 日文
```

但这样做有一个问题：Astro 会把子目录识别为独立的 content collection！

```bash
# Astro 会生成这些"自动集合"：
# posts-zh, posts-en, posts-ja
# 而不是我们想要的统一的 posts 集合
```

**解决方案**：手动创建 `src/content.config.ts`（注意没有 `.`），明确定义集合：

```typescript
import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
    schema: z.object({
        title: z.string(),
        date: z.date(),
        lastmod: z.date().optional(),
        draft: z.boolean().optional().default(false),
        comments: z.boolean().optional().default(true),
        description: z.string().optional().default(""),
        image: z.string().optional().default(""),
        tags: z.array(z.string()).optional().default([]),
        categories: ["z.string().optional().nullable().default(""),"]
        lang: z.string().optional().default(""),
    }),
});

export const collections = {
    posts: postsCollection,  // 覆盖自动生成的 posts-zh, posts-en, posts-ja
};
```

## 2. URL 适配

这是最坑的部分。

中文文章在 `/posts/xxx/`，英文在 `/en/posts/xxx/`。如果用户在看 `/posts/ASR/` 然后点语言切换，理论上应该跳到 `/en/posts/ASR/`。

### 问题一：getStaticPaths 不传 locale

Astro 的 `getStaticPaths` 默认不传 locale 参数：

```typescript
// ❌ 这样写 locale 是 undefined
export async function getStaticPaths({ locale }) {
    const posts = await getSortedPosts(locale);
}

// ✅ 需要硬编码
export async function getStaticPaths() {
    const posts = await getSortedPosts("en");
}
```

这意味着你得为每个语言路由写一个页面文件：
```
src/pages/
├── posts/[...slug].astro      # 中文文章
├── en/posts/[...slug].astro   # 英文文章  
└── ja/posts/[...slug].astro   # 日文文章
```

### 问题二：entry.slug 变了

Astro 5 的 content collections 里，文件在子目录时 `entry.slug` 会包含目录名：

| 文件路径 | entry.slug |
|---------|-----------|
| `posts/zh/ASR.md` | `zh/ASR` |
| `posts/en/ASR.md` | `en/ASR` |

这会导致：
1. 中文文章 URL 变成 `/posts/zh/ASR/`
2. 英文文章 URL 变成 `/posts/en/ASR/`

所以得自己写个函数提取纯 slug：

```typescript
// src/utils/content-utils.ts

/**
 * 从 entry.id 提取纯 slug（不含语言目录前缀）
 * 例如: "zh/ASR.md" → "ASR"
 */
export function getBaseSlug(id: string): string {
    const lastSlash = id.lastIndexOf("/");
    const filename = lastSlash >= 0 ? id.slice(lastSlash + 1) : id;
    return filename.replace(/\.mdx?$/, "");
}
```

然后在所有用到 `entry.slug` 的地方替换成 `getBaseSlug(entry.id)`。

### 问题三：语言切换器逻辑

语言切换器需要处理各种路径情况：

| 当前路径 | 切换到英文 |
|---------|-----------|
| `/` | `/en/` |
| `/posts/ASR/` | `/en/posts/ASR/` |
| `/ja` | `/en` |
| `/ja/` | `/en/` |
| `/ja/posts/ASR/` | `/en/posts/ASR/` |

```typescript
// src/components/LanguageSwitch.svelte

function switchLocale(targetLocale: string) {
    const pathname = window.location.pathname;
    let cleanPath = pathname;

    // 移除现有语言前缀
    for (const loc of locales) {
        if (loc.code !== "zh-cn") {
            // 处理 /ja 和 /ja/ 两种情况
            if (pathname === `/${loc.code}` || pathname.startsWith(`/${loc.code}/`)) {
                cleanPath = pathname.slice(`/${loc.code}`.length) || "/";
                break;
            }
        }
    }

    // 构建新 URL
    if (targetLocale === "zh-cn") {
        newUrl = cleanPath;
    } else {
        newUrl = `/${targetLocale}${cleanPath}`;
    }

    window.location.href = newUrl;
}
```

## 3. 内容过滤逻辑

按语言过滤文章是核心功能：

```typescript
// src/utils/content-utils.ts

function getLangPrefixFromId(id: string): string {
    // 从 ID 中提取语言前缀
    // "zh/ASR.md" → "zh"
    const slashIndex = id.indexOf("/");
    return slashIndex >= 0 ? id.slice(0, slashIndex) : "zh";
}

function matchesLocale(id: string, locale?: string): boolean {
    const prefix = getLangPrefixFromId(id);
    // 统一处理：zh-cn → zh, en → en, ja → ja
    const target = locale === "zh-cn" ? "zh" : locale || "zh";
    return prefix === target;
}

export async function getSortedPosts(locale?: string) {
    const allBlogPosts = await getCollection("posts", ({ id, data }) => {
        const draftFilter = import.meta.env.PROD ? data.draft !== true : true;
        return draftFilter && matchesLocale(id, locale);
    });
    // ... 排序等逻辑
}
```

## 4. 翻译系统改造

原来的翻译是全局的：

```typescript
// ❌ 之前 - 只读 siteConfig.lang
export function i18n(key: I18nKey): string {
    const lang = siteConfig.lang;
    return getTranslation(lang)[key];
}
```

现在需要支持传入语言参数：

```typescript
// ✅ 现在 - 支持动态语言
export function i18n(key: I18nKey, lang?: string): string {
    const targetLang = lang?.toLowerCase().replace("-", "_") || siteConfig.lang || "en";
    return getTranslation(targetLang)[key];
}
```

然后在每个组件中传入当前语言：

```astro
---
const currentLocale = Astro.currentLocale || "zh-cn";
const homeLabel = i18n(I18nKey.home, currentLocale); // 会返回"首页"、"Home"或"ホーム"
---
```

## 5. 页面级别的 locale 处理

每个语言的页面都需要硬编码 locale：

### 中文首页 `src/pages/[...page].astro`
```typescript
export const getStaticPaths = (async ({ paginate }) => {
    const allBlogPosts = await getSortedPosts("zh-cn");  // 硬编码
    return paginate(allBlogPosts, { pageSize: PAGE_SIZE });
}) satisfies GetStaticPaths;

const currentLocale = Astro.currentLocale;  // 动态获取用于显示
```

### 英文首页 `src/pages/en/[...page].astro`
```typescript
export const getStaticPaths = (async ({ paginate }) => {
    const allBlogPosts = await getSortedPosts("en");  // 硬编码
    return paginate(allBlogPosts, { pageSize: PAGE_SIZE });
}) satisfies GetStaticPaths;

const currentLocale = "en";  // 硬编码
```

这里有个小技巧：虽然 `Astro.currentLocale` 在静态构建时确实能正确返回"en"，但为了明确性和避免歧义，我还是选择在每个语言目录下的页面中硬编码 locale。

## 6. 图片路径问题

文章里的图片引用也需要改。比如中文文章在 `posts/zh/init.md`，引用 `init/xxx.png`：

```markdown
原文：`posts/zh/init.md` 中写 `![image](image/init/xxx.png)`
原因：相对于 `posts/` 目录
改后：`posts/zh/init.md` 中写 `![image](init/xxx.png)`
原因：现在文章在 `posts/zh/` 下了，需要往上一级
```

## 7. 导航链接

导航栏的链接需要带上语言前缀：

```astro
---
const currentLocale = Astro.currentLocale || "zh-cn";
---

<!-- 之前 -->
<a href="/about/">关于</a>

<!-- 现在 -->
<a href={`/${currentLocale === "zh-cn" ? "" : `/${currentLocale}`}/about/`}>关于</a>
```

或者封装成工具函数：

```typescript
// src/utils/url-utils.ts

export function url(path: string, locale?: string): string {
    const base = joinUrl("", import.meta.env.BASE_URL, path);
    if (!locale || locale === "zh-cn" || locale === "zh_CN") {
        return base;  // 默认语言不加前缀
    }
    return joinUrl("", import.meta.env.BASE_URL, `/${locale.replace("_", "-")}`, path);
}
```

## 8. RSS 和 Sitemap

### RSS

每个语言需要独立的 RSS：

```
src/pages/rss.xml.ts         → /rss.xml (中文)
src/pages/en/rss.xml.ts      → /en/rss.xml (英文)
src/pages/ja/rss.xml.ts      → /ja/rss.xml (日文)
```

### Sitemap

`@astrojs/sitemap` 集成会自动处理多语言 sitemap，只需要配置好 `i18n` 选项：

```javascript
// astro.config.mjs
sitemap({
    i18n: {
        defaultLocale: "zh-cn",
        locales: {
            "zh-cn": "zh-CN",
            "en": "en",
            "ja": "ja",
        },
    },
}),
```

## 9. 搜索适配

Pagefind 支持多语言索引，通过 `data-pagefind-filter` 属性：

```astro
<div data-pagefind-filter={`lang:${currentLocale}`}>
    <div data-pagefind-body>
        <!-- 文章内容 -->
    </div>
</div>
```

搜索时按语言过滤：

```typescript
const response = await window.pagefind.search(keyword, {
    filters: { lang: currentLocale }
});
```

## 10. 其他需要改的地方

1. **Sidebar 组件**：分类、标签链接带语言前缀
2. **Pagination 组件**：分页链接带语言前缀
3. **PostCard 组件**：文章卡片链接带语言前缀
4. **ArchivePanel 组件**：归档页面按语言过滤
5. **Footer**：RSS、Sitemap 链接带语言前缀
6. **SEO**：`<html lang="...">` 需要正确设置

# 最终结果

现在这个博客支持三种语言了：

| 语言 | 路由 | 导航文字 |
|------|------|---------|
| 🇨🇳 中文 | `/` | 首页、归档、关于 |
| 🇺🇸 英文 | `/en/` | Home、Archive、About |
| 🇯🇵 日文 | `/ja/` | ホーム、アーカイブ、このサイト |

语言切换按钮在右上角地球图标那里。

每种语言的文章是独立管理的，中文站只显示中文文章，英文站只显示英文文章。

# 结语

总的来说，用 AI 辅助编程还是靠谱的。它能帮你写代码，但关键的架构决策还是得自己来。比如为什么选方案二不选方案一，为什么要在每个页面硬编码 locale，这些都需要自己判断。

AI 可以帮你：
- ✅ 写代码
- ✅ 解释概念
- ✅ 提供示例
- ✅ 帮你调试

AI 不能帮你：
- ❌ 做架构决策
- ❌ 理解你的业务需求
- ❌ 判断什么是正确的方向

最后，感谢 AI，感谢 Claude，让我这个博客终于能"国际化"了（虽然英文文章只有那么几篇）。

> 本来以为要肝很久，没想到一边和 AI 讨论一边写这篇文章，时间过得还挺快的。

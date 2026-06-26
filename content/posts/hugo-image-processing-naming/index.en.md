---
title: "Don't Name Your Hugo Images with _hu_ Yourself"
date: 2026-06-26
lastmod: 2026-06-26
tags: ["hugo", "web", "bug", "lesson"]
categories: ["Tech"]
draft: true
image: "thumbnail.webp"
comments: true
---

I recently moved my blog from Astro to Hugo, and along the way I stepped into an image-related pit — a really **counter-intuitive** one.

It wasn't a config error, and it wasn't a template error. **It was the filename of the image itself.**

# The symptom

I had a hero image sitting in a page bundle (`content/posts/migrate/`) and, following the Hugo docs, I referenced it from the front matter:

```yaml
---
image: "screenshot_hu_abbd89ec6dbc88ab.webp"
---
```

The file was there, the path was right, the build went through, and the hero rendered fine. But when I looked at the `public/` directory, something felt **off**:

```
public/posts/migrate/
├── index.html
├── screenshot_hu_abbd89ec6dbc88ab.webp        ← my source image (with _hu_ hash suffix)
├── screenshot_hu_9d8a22b113dd454b.webp        ← extra
├── screenshot_hu_ea78254d840d49f9.webp        ← extra
├── screenshot_hu_467286a86f2f96b0.webp        ← extra
├── screenshot_hu_62f63198a1be875a.webp        ← extra
├── screenshot_hu_a436b69ad26ae17c.webp        ← extra
└── screenshot_hu_c230d19cfce27e36.webp        ← extra
```

Why are there six extra `_hu_`-prefixed webp files next to my source image?

# What was going on

`_hu_<hash>.<ext>` is **Hugo's own internal naming convention for image processing output**.

During a build, Hugo scans all the image resources in a page bundle, computes a hash from each image's **content** (to avoid name collisions), prefixes it with `_hu_`, and that's the processed output. This is an **internal implementation detail** — it's not a naming convention for users to follow manually.

But here's the kicker: Hugo **doesn't recognize** that prefix as a "this image has already been processed, please skip it" signal. It still treats `_hu_xxx.webp` as a **fresh source image**:

1. Sees `_hu_abbd89ec6dbc88ab.webp` → treats it as source
2. Runs image processing on it (generates srcset, reformat, etc.)
3. The processed output gets a *new* `_hu_<new-hash>.webp` name → `_hu_9d8a22b113dd454b.webp` and friends
4. Meanwhile, the **original file itself** also gets copied to `public/` per the page resource rules

The result: you thought you were saying "this is already processed", but Hugo processed it again and produced a pile of `hu_` files you never asked for.

# The right way to do it

Use a **simple, semantic source filename**, and let Hugo handle the processing.

```yaml
---
image: "screenshot.webp"
---
```

Source layout:

```
content/posts/migrate/
├── index.md
├── index.en.md
├── index.ja.md
├── index.sak.md
├── screenshot.webp     ← source image, simple name
└── assets/
    └── 2026-06-26-13-24-20-image.png   ← image used inline in the post body
```

After build, the HTML looks like this:

```html
<img
  src="/posts/migrate/screenshot.webp"
  srcset="/posts/migrate/screenshot_hu_9d8a22b113dd454b.webp 800w, /posts/migrate/screenshot.webp 1280w"
  width="1280"
  height="853"
  alt="...">
```

Crystal clear:

- `src` points to **your source image** (the simple name)
- The `_hu_xxx.webp` entries in `srcset` are **800w responsive variants** that Hugo generated on its own
- At render time, the browser picks the most appropriate resource based on viewport width

The extra `screenshot_hu_xxx.webp` files in `public/` are just **image processing intermediates from Hugo's cache**, which Hugo manages automatically (`hugo --gc` cleans up unreferenced ones). You don't need to do anything with them.

# How I caught it

Honestly, I didn't notice it at first. **`image: "screenshot_hu_..."` plus a real file with that name built without errors, and the hero rendered fine.** Everything looked normal.

It was only when I saw those six mysterious `hu_` files in `public/` that something felt wrong. I tried a quick experiment: renamed the source to `screenshot.webp`, updated the front matter to match, and rebuilt. The six junk files disappeared, and the HTML `srcset` was actually *cleaner* (a sensible 800w variant + the original).

That's when it clicked: **`_hu_` is Hugo's internal "content fingerprint", not an "already processed" marker.**

# The lesson

- **Don't manually name images with `_hu_<hash>.<ext>`.** That's an output convention of Hugo's internal pipeline.
- Use short, semantic source filenames (`screenshot.webp`, `cover.jpg`) and let Hugo generate the variants.
- If you're not sure whether a particular image should go in `image:`, **build once and look at `public/`** — check whether the resources in `src` and `srcset` actually line up with what you wrote.

# Afterword

Honestly, Hugo's image processing docs aren't bad, but they don't make this implicit conflict between **naming convention** and **what users are allowed to name things** very clear. To a user, `hu` looks like a "system tag" — but it isn't.

If you're also migrating from another framework (like me, from Astro) or trying Hugo's image processing for the first time, do yourself a favor: **start with source filenames**, and don't try to be clever.

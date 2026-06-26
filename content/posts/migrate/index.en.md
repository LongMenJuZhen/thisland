---
title: "Yes, Another Migration"
date: 2026-06-26T12:09:52+09:00
lastmod: 2026-06-26T12:09:52+09:00
tags: ["hugo", "web"]
categories: ["Tech"]
draft: false
image: "screenshot.webp"
---

> [!NOTE]
> This article was translated from Chinese by AI. Source: [是的，又一次迁移](../migrate/).

# Suddenly, this blog is now on Hugo

On the occasion of this house move, I think it's still necessary for me to record why I made this choice.

You know, by the usual playbook, an architecture migration always goes from the old to the new — so how could there be one going the other way?

What do you mean, [Astro upgraded to 7.0](https://astro.build/blog/astro-7/), so you decided to migrate from Astro 6 to Hugo? You have to remember, Hugo has been around since 2013, while Astro only came out in 2021. Astro is supposedly "more modern" than Hugo by a full eight years.

![](assets/2026-06-26-13-24-20-image.png)

## Astro isn't content-driven enough

Astro considers itself a content-driven framework, but in my view, to put it in a nutshell, Astro assumes you'll maintain a complete static website project on your own, rather than sharing a common template and personalizing the configuration. Astro is a content-driven web project, not content with some configuration that you can distribute online.

Concretely, this shows up in that Astro doesn't manage the theme template as a dependency the way Hugo does. When you initialize a web project you have to clone all the source code locally, and you (or the template author) must explicitly specify where the configuration files are. Not like Hugo, which just points to the `config\_default` folder.

On the other hand, when you want to define your own components in Astro, you have to modify your local copy of the theme. At development time this looks intuitive, but what happens two months later when the original author updates the theme? You have to merge it yourself!

Admittedly, we have AI now, but that doesn't make the problem simpler — when the code conflicts, you still have to make trade-offs, and the AI doesn't necessarily understand which side you'd rather keep.

### On the other hand, some viewers (do they really exist?) are bound to ask

Didn't you originally say you didn't want a blog site, just a personal homepage? Didn't you also say that blogs, that web 1.0 relic, should have been淘汰'd long ago?

You're right, but even for a Douyin creator, doesn't he still write a script? Vibe motion and AI-generated video are developing faster and faster, and the path of scripts being auto-converted to video is becoming real. So, since I've already written the script, should I post it anywhere other than this site? Should I dump it on Zhihu where the recommendations are, frankly, kind of a joke? Better to just self-host and let search engines crawl it.

## Is MDX really that good?

Astro uses MDX, while Hugo uses shortcodes. When I was making technology choices in 2025, this point pushed me toward preferring Astro — but looking back now, that judgment was wrong.

- MDX looks like an open file format, but it's actually deeply tied to React (that's what the AI said; I don't quite know what that means either)

- MDX adds JS scripts inside Markdown. As everyone knows, JS isn't exactly a great language. On top of that, it blurs the line between content and code, and the code chunks in MDX can even depend on each other across the file, bringing enormous complexity. The thing is, this complexity is overkill for content.

  - Hugo shortcodes, on the other hand, look much nicer: elements have no dependencies, at worst there are just a few extra braces. Also, I try not to extend Markdown's syntax — at most, I want to render certain Markdown elements differently.

## Comments

Also, in a corner nobody noticed, the comment system has been switched to Giscus, borrowing GitHub's servers.

Why? Because I found out that services like Waline rely on a database that goes to sleep if there are no visits for a month.

Yes, as a small site, it's a real shame that I can't guarantee someone visits every month, but I also don't want to write a heartbeat script — that feels like I'm deceiving the database platform (where this sudden moral high ground came from, I don't know). So I chose Giscus, leveraging GitHub to power the comment system.

GitHub may变质, but it won't go under.

So if you'd like to comment, please take a moment to register a GitHub account. While you're already on GitHub anyway, feel free to give this blog a ⭐ too.

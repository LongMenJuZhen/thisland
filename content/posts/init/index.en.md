---
title: "A Personal Blog, but in 2025!"
date: 2025-07-01
tags: ["web", "astro"]
categories: ["Tech"]
draft: false
---

If you're reading this article, congratulations! It means this little website has finally emerged from its stone-age development phase and is ready to host some actual content. As the first post on this site, and while the details are still fresh in my mind, let me talk about how this site was built, what tech stack it uses, and which similar projects I drew inspiration from. If you're thinking of building a similar personal site, I hope these experiences will be of some help.

But before we dive into the hardcore technical details, let's first answer a soul-searching question.

# In the era of short videos, why do you still need a blog?

From my own perspective, a personal blog can fulfill these needs.

- **Cross-platform links**: I want a personal homepage that ties together my accounts on various platforms, so that people who know me on platform A can easily find me on platform B.
- **Personal résumé**: Given that yours truly will most likely spend a period as a research student, by the conventions of academia I probably need a personal page introducing my research area, publications, educational background, etc. — useful for attracting potential collaborators.
- **Sharing technical articles**: As everyone knows, programmers consult a lot of references while coding (at least before GPT came along). With so many references, you inevitably need to organize and consolidate them, and that process naturally produces documentation. These docs, with a bit of polish, can become technical articles — and since you've written them anyway, why not publish them somewhere?

Of course, none of these strictly require a personal website. Linking accounts can be done with [linktr](https://linktr.ee/). Academics sometimes just use their university page or a Google Scholar profile. As for sharing technical articles, content platforms like Zhihu, Jianshu, or cnblogs all support that — and they have built-in recommendation algorithms that actively push your articles to potential readers, giving you far more exposure than search engines alone.

These ready-made solutions can satisfy what most people imagine when they think of a blog. However, self-hosting still has irreplaceable advantages over them: **data security** and **flexibility**.

### Data security

"Data security" is a bit of a stretch — it's not really that secure. Someone somewhere can always take your content down. Without getting into topics that get posts deleted, even the international domain-name governing body has the authority to revoke your domain. (Though what kind of genius would have to be to actually do something against all of humanity?)

That said, compared to Zhihu, cnblogs, and similar platforms, a personal website gives you at least a local git repo when you get banned. Change the domain and the host, and you can rise from the ashes. Your articles don't end up locked to a single platform.

## Flexibility

Tell me — is it possible that someday, future-me will want to embed some videos, 3D content, or even an interactive mini-game in the blog? These things are trivial to share through a browser, but much harder to post on social media.

# It's 2025 — what are the options for self-hosting a blog?

Honestly, I keep thinking I spent way too much time on tech selection. By the time I picked a framework, other people had already hand-rolled their themes from scratch. But hey, here we are — I've decided to write it all down properly. Hope it helps you.

Broadly speaking, the choice of tech comes down to two factors: how much 💰 do you have to spend on a server, and how much ability do you have to write custom code?

![1754198183377](1754198183377.png)

## The full-fat dynamic site route

If you happen to be flush with cash, you can deploy a full-fat dynamic site — back-end and front-end, an app with rich features. The back-end can be written in any language: Java, Rust, Python. You can freely (?) pick whichever you like to implement the business logic.

But the freedom you feel while writing code becomes pain during deployment. Most Docker-based sites are billed by usage — you end up paying three to five hundred a year. So I gave up on this approach, but for friends with a bit of budget it's worth considering. After all, even so, Docker is much cheaper than a VPS. For dynamic site deployment platforms, the table below is a good reference.

### [halo](https://www.halo.run/)

Halo is a complete blog solution. Beyond dark mode and i18n, it even gives you AI, SEO, the whole package. With it, you can avoid writing any code — just click around in the admin panel. The rich plugin and theme ecosystem is also very convenient, and if you're willing to spend a little money, you can get automatic backups without writing a single line of code. Great for people who'd rather throw money at the problem than time.

### WordPress

Too old. As someone who loves the new, I just can't bring myself to use it.

### DIY

If you have the time, you can of course write your own. Go ahead, go ahead.

## Static sites — though they're not really that static

### Front-end hosting

Actually, a blog with a comment section isn't strictly a static site anymore. What I mean by "static site" here is **JAMstack**. For deployment, the main options are [Netlify](https://www.netlify.com/) and [Vercel](https://vercel.com/).

### Framework choice

Noticing the differences in project file structure, I divide frameworks into two camps: **developer-first** and **theme-first**.

#### Developer-first

##### [Astro](https://astro.build/)

As you can see, the author ultimately picked Astro.

#### [Flutter](https://flutter.cn/)

As what you could call the next-generation Qt front-end framework, Flutter's advantages are clear.

#### Next.js

Feels inferior to Astro.

### Theme-first

#### [Hugo](https://gohugo.io/)

- Written in Go, generally quite modern.
- The [Blowfish](https://blowfish.page/) theme on top of it is gorgeous.

#### [Hexo](https://hexo.io/zh-cn/)

- Has a plugin ecosystem.

#### [Zola](https://www.getzola.org/)

- Reportedly the templating is smoother than Hugo's.

# Taking it further

I have great hopes for this site. Some features are already in place; others will have to wait for next time.

## Comments

Waline was chosen for the comment component.

## i18n

Abandoned. I doubt a personal blog has the bandwidth to provide multilingual versions of every post.

## 🚧 Under construction

- [ ] Use shaders to make a pretty dynamic background.
- [ ] Backend traffic analytics.
- [ ] Can categories and folders be unified?

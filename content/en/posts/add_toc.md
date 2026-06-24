---
title: Adding a Table of Contents While Keeping Swup's Smooth Transitions
date: 2025-08-05


tags: [astro,fuwari,swup]
categories: ["Tech"]
draft: false
showComments: true
---

# Introduction

Fuwari comes with a built-in table of contents component. You can enable it in `src/config.ts`:

```typescript
toc: {
    enable: true, // Display the table of contents on the right side of the post
    depth: 2, // Maximum heading depth to show in the table, from 1 to 3
},
```

But the default behavior is far from ideal. You probably can't even see it—it's hidden behind the sidebar.

It's like two kings refusing to meet.

Where did it go? You need to shrink the page with `ctrl -` to see it.

Considering there's plenty of space on the left sidebar, putting it on the right is indeed a peculiar choice.

# Configuration

:::warning[There's a bug]
This will break the smooth page transitions. See below for the fix.
:::

Go to `src/layouts/MainGridLayout.astro` and remove the original TOC component.

```astro

            <SideBar class="mb-4 row-start-2 row-end-3 col-span-2 lg:row-start-1 lg:row-end-2 lg:col-span-1 lg:max-w-[17.5rem] onload-animation" headings={headings}></SideBar>

            <main id="swup-container" class="transition-swup-fade col-span-2 lg:col-span-1 overflow-hidden">
                <div id="content-wrapper" class="onload-animation">
                    <!-- the overflow-hidden here prevent long text break the layout-->
                    <!-- make id different from windows.swup global property -->
                    <slot></slot>
                    <div class="footer col-span-2 onload-animation hidden lg:block">
                        <Footer></Footer>
                    </div>
                </div>
            </main>

            <div class="footer col-span-2 onload-animation block lg:hidden">
                <Footer></Footer>
            </div>
        </div>

        <BackToTop></BackToTop>
    </div>
</div>

<!-- The things that should be under the banner, only the TOC for now -->
<!-- <div class="absolute w-full z-0 hidden 2xl:block">
    <div class="relative max-w-[var(--page-width)] mx-auto">
         #TOC component
        {siteConfig.toc.enable && <div id="toc-wrapper" class:list={["hidden lg:block transition absolute top-0 -left-[var(--toc-width)] w-[var(--toc-width)] items-center",
            {"toc-hide": siteConfig.banner.enable}]}
        >
            <div id="toc-inner-wrapper" class="fixed top-14 w-[var(--toc-width)] h-[calc(100vh_-_20rem)] overflow-y-scroll overflow-x-hidden hide-scrollbar">
                <div id="toc" class="w-full h-full transition-swup-fade ">
                    <div class="h-8 w-full"></div>
                    <TOC headings={headings}></TOC>
                    <div class="h-8 w-full"></div>
                </div>
            </div>
        </div>}

         #toc needs to exist for Swup to work normally
        {!siteConfig.toc.enable && <div id="toc"></div>}
    </div>
</div> -->
</Layout>
```

Then modify `src/components/widget/SideBar.astro` to look like this:

```astro
---
import { siteConfig } from "@/config";

import type { MarkdownHeading } from "astro";
import Categories from "./Categories.astro";

import Profile from "./Profile.astro";
import Tag from "./Tags.astro";
import TOC from "./TOC.astro"; // 1. Import the TOC component

interface Props {
    class?: string;
    headings?: MarkdownHeading[];
}
const { headings = [] } = Astro.props;
const className = Astro.props.class;
---
<div id="sidebar" class:list={[className, "w-full"]}>
    <div class="flex flex-col w-full gap-4 mb-4">
        <Profile></Profile>
    </div>
    <div id="sidebar-sticky" class="transition-all duration-700 flex flex-col w-full gap-4 top-4 sticky top-4">
        <Categories class="onload-animation" style="animation-delay: 150ms"></Categories>
        <Tag class="onload-animation" style="animation-delay: 200ms"></Tag>
        <TOC headings={headings}></TOC>
    </div>
</div>
```

Done!

### PS

This change will break Fuwari's smooth page transition effect—the feature where pages switch without refreshing the entire page. I asked Gemini about it and managed to fix it.

The root cause is that Fuwari uses **Swup.js** for smooth page transitions instead of traditional full-page refreshes. Swup refreshes content based on container IDs. So we need to preserve the container IDs when adding components.

For `src/layouts/MainGridLayout.astro`, keep an empty placeholder:

```html
<!-- The things that should be under the banner, only the TOC for now -->
<!-- Add this empty, hidden div to make Swup work normally -->
<div id="toc" class="hidden"></div>
</Layout>
```

For `src/components/widget/SideBar.astro`, add a container with an ID:

```html
<div id="sidebar" class:list={[className, "w-full"]}>
    <div class="flex flex-col w-full gap-4 mb-4">
        <Profile></Profile>
    </div>
    <div id="sidebar-sticky" class="transition-all duration-700 flex flex-col w-full gap-4 top-4 sticky top-4">
        <Categories class="onload-animation" style="animation-delay: 150ms"></Categories>
        <Tag class="onload-animation" style="animation-delay: 200ms"></Tag>
        <!-- Wrap TOC in a container with id so Swup can refresh it locally -->
        <div id="toc">
            <TOC headings={headings}></TOC>
        </div>
    </div>
</div>
```

And the smooth transitions are back!

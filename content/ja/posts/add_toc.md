---
title: ブログに目次を追加、swupのスムーズ効果を維持する方法
date: 2025-08-05


tags: [astro,fuwari,swup]
categories: ["技術"]
draft: false
showComments: true
---

# はじめに

fuwariには最初から目次コンポーネントが付属していて、`src/config.ts`で有効にできる。

```typescript
toc: {
    enable: true, // Display the table of contents on the right side of the post
    depth: 2, // Maximum heading depth to show in the table, from 1 to 3
},
```

でもデフォルトの設定は芳しくない，大多数看不到：

王見せず。

缩小页面后才能見えるようになる。

左側のサイドバーには大きな空間があるから，右側に置くのは少し変わった選択だね。

# 設定

:::warning[バグがあるよ]
これでスムーズ効果が消えてしまう，下記を参照してね
:::

`src/layouts/MainGridLayout.astro`の目次を削除して，`src/components/widget/SideBar.astro`を変更する。

# PS

这样添加目录会导致fuwariのスムーズページ遷移効果が失效してしまう。geminiに聞いて修復したよ。

問題の来源は、fuwariは従来の全ページ更新ではなく**Swup.js**ライブラリ用来实现页面间的平滑过渡だ。swup根据容器的id来刷新容器内容。所以添加组件时要保持容器的id。

`src/layouts/MainGridLayout.astro`には空のプレースホルダーを保持する必要がある。

`src/components/widget/SideBar.astro`にはid付きのコンテナを追加する必要がある。

スムーズ効果は復元されたよ。

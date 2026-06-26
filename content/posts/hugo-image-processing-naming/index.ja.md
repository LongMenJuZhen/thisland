---
title: "Hugoの画像、自分で_hu_と名付けないで"
date: 2026-06-26
lastmod: 2026-06-26
tags: ["hugo", "web", "bug", "教訓"]
categories: ["技術"]
draft: true
image: "thumbnail.webp"
comments: true
---

最近ブログをAstroからHugoに移行したんだけど、その途中で画像関連でハマった。**直感に反する**ハマり方だった。

設定ファイルの書き間違いでも、テンプレートのミスでもなかった。**画像ファイル名そのもの**が問題だった。

# 現象

あるpage bundle（`content/posts/migrate/`）にhero用の画像を置いて、Hugoのドキュメント通りにfront matterから参照した：

```yaml
---
image: "screenshot_hu_abbd89ec6dbc88ab.webp"
---
```

ファイルは存在し、パスも正しく、ビルドも通り、heroもちゃんと表示された。でも`public/`を見てみると、**何かおかしい**：

```
public/posts/migrate/
├── index.html
├── screenshot_hu_abbd89ec6dbc88ab.webp        ← ソース画像（_hu_ハッシュ付き）
├── screenshot_hu_9d8a22b113dd454b.webp        ← 余分
├── screenshot_hu_ea78254d840d49f9.webp        ← 余分
├── screenshot_hu_467286a86f2f96b0.webp        ← 余分
├── screenshot_hu_62f63198a1be875a.webp        ← 余分
├── screenshot_hu_a436b69ad26ae17c.webp        ← 余分
└── screenshot_hu_c230d19cfce27e36.webp        ← 余分
```

ソース画像の横に、なぜ`_hu_`始まりのwebpが6個もできているんだ？

# 原因

`_hu_<ハッシュ>.<拡張子>`は**Hugo自身の画像処理用ネーミング規約**。

Hugoはビルド時にpage bundle内のすべての画像リソースをスキャンし、各画像の**内容**からハッシュを計算し（名前の衝突を避けるため）、`_hu_`プレフィックスを付けて出力する。これは**内部実装の詳細**で、ユーザーが手動で使う命名規約ではない。

ところが問題なのは：Hugoはこの命名を「処理済みだからスキップしてくれ」というシグナルとして**認識しない**。`_hu_xxx.webp`は依然として**新しいソース画像**として扱われる：

1. `_hu_abbd89ec6dbc88ab.webp`を検出 → ソースとして扱う
2. 画像処理を実行（srcset生成、reformat等）
3. 処理結果に**新しい**`_hu_<新ハッシュ>.webp`名を付ける → `_hu_9d8a22b113dd454b.webp`など
4. 一方、**元のファイル自体**もpage resourceのルールで`public/`にコピーされる

結果：「処理済み画像」と思って指定したものが、Hugoに再度処理されて、想定外の`hu_`ファイルを大量生成することに。

# 正しいやり方

**シンプルで意味のあるソースファイル名**を使って、Hugoに処理を任せる。

```yaml
---
image: "screenshot.webp"
---
```

ソースの配置：

```
content/posts/migrate/
├── index.md
├── index.en.md
├── index.ja.md
├── index.sak.md
├── screenshot.webp     ← ソース画像、シンプルな名前
└── assets/
    └── 2026-06-26-13-24-20-image.png   ← 本文中で使う画像
```

ビルド後のHTML：

```html
<img
  src="/posts/migrate/screenshot.webp"
  srcset="/posts/migrate/screenshot_hu_9d8a22b113dd454b.webp 800w, /posts/migrate/screenshot.webp 1280w"
  width="1280"
  height="853"
  alt="...">
```

すっきりした：

- `src`は**ソース画像**（シンプルな名前）を指す
- `srcset`内の`_hu_xxx.webp`はHugoが**自動生成した**800wレスポンシブバリアント
- レンダリング時にブラウザがビューポート幅に応じて最適なリソースを自動選択

`public/`に増えた`screenshot_hu_xxx.webp`は**Hugoの画像処理キャッシュの中間生成物**で、Hugoが自動管理する（`hugo --gc`で未参照のものをクリーンアップ）。ユーザーが手動で何かする必要はない。

# どうやって気づいたか

正直最初は気づかなかった。**`image: "screenshot_hu_..."`に実在するファイルを指定すれば、エラーなくビルドでき、heroも普通に表示される**。すべて正常に見える。

異変に気づいたのは、`public/`にあの6個もの謎の`hu_`ファイルを見た時。試してみた：ソースを`screenshot.webp`にリネーム、front matterも合わせて更新、再ビルド。6個のゴミファイルは消え、HTMLの`srcset`は逆にきれいになった（800wバリアント＋原画）。

その時ハッと思った：**`_hu_`はHugoの内部の「コンテンツ指紋」であって、「処理済み」マーカーではない**、と。

# 教訓

- **`_hu_<ハッシュ>.<拡張子>`というファイル名を自分で付けない**。これはHugoの内部パイプラインの出力規約。
- 短く意味のあるソースファイル名（`screenshot.webp`, `cover.jpg`）を使って、バリアント生成はHugoに任せる。
- ある画像を`image:`で参照すべきか迷ったら、**まずビルドして`public/`を見る**。`src`と`srcset`のリソースが自分が書いたものと一致しているか確認する。

# あとがき

ぶっちゃけHugoの画像処理ドキュメントはそこまで悪くないんだけど、**「ネーミング規約」と「ユーザーが使って良い名前」の間の暗黙の衝突**は書かれていない。ユーザーから見ると、`hu`は「システムタグ」っぽく見えるけど、そうではない。

他のフレームワークから移行する人（私のようにAstroからとか）や、Hugoの画像処理を初めて触る人には言っておく：**最初はソースファイル名でやって**、賢くなろうとするな。

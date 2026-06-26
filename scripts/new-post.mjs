#!/usr/bin/env node
// 给定 slug, 在 content/posts/<slug>/ 下创建 page bundle:
//   - index.md         (zh-cn, 用 archetypes/posts.md)
//   - index.en.md      (en, 同 archetype, draft: true)
//   - index.ja.md      (ja, 同 archetype, draft: true)
// sak 由 scripts/mirror-sak.mjs 从 index.en.md 自动生成.
//
// 用法:  node scripts/new-post.mjs <slug> [title]
// 例:    node scripts/new-post.mjs hello-world
//        node scripts/new-post.mjs hello-world "Hello World 标题"
import { spawnSync } from 'node:child_process';
import { existsSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const [, , slug, ...titleParts] = process.argv;
if (!slug) {
  console.error('用法: node scripts/new-post.mjs <slug> [title]');
  console.error('例:   node scripts/new-post.mjs hello-world');
  process.exit(1);
}
if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug)) {
  console.error(`✖ slug 必须是 kebab-case, 字母数字+短横线: "${slug}"`);
  process.exit(1);
}

const BUNDLE = join('content/posts', slug);
if (existsSync(BUNDLE)) {
  console.error(`✖ ${BUNDLE}/ 已存在, 不覆盖`);
  process.exit(1);
}
mkdirSync(BUNDLE, { recursive: true });

// 1) zh-cn: 让 Hugo 用 archetypes/posts.md 渲染 content/posts/<slug>/index.md
console.log(`  $ hugo new posts/${slug}/index.md`);
const hugo = spawnSync('hugo', ['new', `posts/${slug}/index.md`], { stdio: 'inherit' });
if (hugo.status !== 0) {
  console.error('✖ hugo new 失败');
  process.exit(1);
}

// 2) en / ja: 复制 archetype 渲染结果, 改 front matter 的 title 和 categories
const enRaw = readFileSync(join(BUNDLE, 'index.md'), 'utf8');
const enOut = enRaw
  .replace(/^title:.*$/m, `title: "${titleParts.join(' ') || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}"`)
  .replace(/^categories:.*$/m, 'categories: ["Tech"]');
writeFileSync(join(BUNDLE, 'index.en.md'), enOut, 'utf8');

const jaOut = enOut.replace(
  /^categories:.*$/m,
  'categories: ["技術"]'
);
writeFileSync(join(BUNDLE, 'index.ja.md'), jaOut, 'utf8');

console.log(`✓ 已创建 ${BUNDLE}/`);
console.log(`  - index.md      (zh-cn, draft)`);
console.log(`  - index.en.md   (en,    draft)`);
console.log(`  - index.ja.md   (ja,    draft)`);
console.log(`  - index.sak.md  (sak,   由 mirror-sak 自动生成)`);
console.log('');
console.log('下一步:');
console.log(`  1. 编辑 ${BUNDLE}/index.md (zh-cn 正文)`);
console.log(`  2. 编辑 ${BUNDLE}/index.en.md, index.ja.md (翻译)`);
console.log(`  3. 准备好后把 front matter 的 draft 改成 false`);
console.log(`  4. 跑 pnpm dev 或 pnpm build`);

#!/usr/bin/env node
// 把 content/** 下所有 .en.md 翻译分支生成为 .sak.md.
// 萨卡兹 (sak) 虚构语言的内容跟英语完全一致, 只字体换成 EndfieldByButan
// (见 assets/scss/custom.scss 里的 html[lang="sak"] 选择器).
// 不在 git 里跟踪这些 .sak.md, 每次 dev/build 前都自动同步, 避免手动维护两份.
//
// 同样原理: .en.md 是英文版, .sak.md 是 sak 版, 正文相同;
// Hugo 看到 .sak.md 后缀就会按 languages.sak 渲染.
import {
  readdirSync,
  readFileSync,
  writeFileSync,
  statSync,
  unlinkSync,
  existsSync,
} from "node:fs";
import { join, dirname, basename, extname } from "node:path";

const ROOT = "content";
const SRC_EXT = ".en.md";
const DST_EXT = ".sak.md";

let created = 0;
let removed = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      walk(p);
    } else if (st.isFile() && p.endsWith(SRC_EXT)) {
      const dst = p.slice(0, -SRC_EXT.length) + DST_EXT;
      const srcContent = readFileSync(p, "utf8");
      // sak 版正文 = 英文版正文, 不改 front matter, Hugo 会按 .sak.md 后缀识别语言.
      writeFileSync(dst, srcContent, "utf8");
      created++;
    } else if (st.isFile() && p.endsWith(DST_EXT)) {
      // 已被镜像脚本接管: 找到对应的 .en.md, 若不存在则删除 .sak.md
      const src = p.slice(0, -DST_EXT.length) + SRC_EXT;
      if (!existsSync(src)) {
        unlinkSync(p);
        removed++;
        console.log(`  - ${p} (no corresponding ${SRC_EXT})`);
      }
    }
  }
}

if (!existsSync(ROOT)) {
  console.error(`✖ ${ROOT} 不存在`);
  process.exit(1);
}

walk(ROOT);
console.log(`✓ sak mirror: ${created} created, ${removed} removed`);

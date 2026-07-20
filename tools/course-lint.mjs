#!/usr/bin/env node
/** 对课程 Markdown 做可复现的坏味道与证据提示扫描。 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const PHRASES = [
  ["不是…而是…", /不是[^。！？\n]{0,40}而是/],
  ["背景模板", /在[^。！？\n]{0,30}(?:浪潮|背景|时代)下|随着[^。！？\n]{0,30}的发展/],
  ["重要性空话", /重中之重|关键所在|至关重要/],
  ["手段套话", /以[^。！？\n]{0,20}为抓手|赋能|通过[^。！？\n]{0,30}实现/],
  ["机械枚举", /首先|其次|最后|综上所述|总而言之/],
];

function markdownFiles(target) {
  const stat = statSync(target);
  if (stat.isFile()) return target.endsWith(".md") ? [target] : [];
  return readdirSync(target, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(target, entry.name);
    return entry.isDirectory() ? markdownFiles(child) : entry.name.endsWith(".md") ? [child] : [];
  });
}

export function lintFile(file) {
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  const issues = [];
  let id = 0;
  const add = (line, category, severity, evidence, action = "auto_fix") => issues.push({
    review_id: `lint-${path.basename(file, ".md")}-${++id}`,
    scope: "lesson", artifact: file, locator: `line:${line}`,
    category, severity, evidence, action, status: "open", suggestion: null, revision_locator: null,
  });
  lines.forEach((line, index) => {
    for (const [name, pattern] of PHRASES) if (pattern.test(line)) add(index + 1, "ai_smell", "medium", `${name}：${line.trim()}`);
    if (/\d+(?:\.\d+)?%/.test(line) && !/(?:source_id|来源|待确认|knowledge_card)/i.test(line)) add(index + 1, "unsupported_claim", "high", `百分比缺少同段来源提示：${line.trim()}`, "needs_evidence");
  });
  const paragraphs = readFileSync(file, "utf8").split(/\r?\n\s*\r?\n/);
  for (let i = 0; i < paragraphs.length - 2; i += 1) {
    const group = paragraphs.slice(i, i + 3);
    if (group.every((text) => !text.includes("\n") && text.trim().length > 0 && text.trim().length <= 18 && !/^#|^[-*]|^>/.test(text.trim()))) {
      const before = paragraphs.slice(0, i).join("\n\n");
      add(before.split(/\r?\n/).length + (i ? 2 : 0), "spoken_flow", "medium", `连续单句段：${group.map((x) => x.trim()).join(" / ")}`);
      i += 2;
    }
  }
  return issues;
}

export function lintTarget(target) { return markdownFiles(target).flatMap(lintFile); }

if (process.argv[1] && import.meta.url === new URL(`file://${path.resolve(process.argv[1])}`).href) {
  const target = process.argv[2];
  if (!target) { console.error("用法：course-lint.mjs <markdown-file-or-dir> [--output review.jsonl]"); process.exit(2); }
  const issues = lintTarget(target);
  const text = issues.map((item) => JSON.stringify(item)).join("\n") + (issues.length ? "\n" : "");
  const outputIndex = process.argv.indexOf("--output");
  if (outputIndex >= 0) writeFileSync(process.argv[outputIndex + 1], text, "utf8");
  else process.stdout.write(text);
  console.error(JSON.stringify({ files: markdownFiles(target).length, issues: issues.length }));
}

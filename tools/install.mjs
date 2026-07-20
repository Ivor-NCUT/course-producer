#!/usr/bin/env node
/** 把仓库中的 Skills 链接到 Codex skill 目录。 */

import { existsSync, lstatSync, mkdirSync, readlinkSync, symlinkSync, unlinkSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import process from "node:process";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const target = path.resolve(process.env.CODEX_HOME || path.join(homedir(), ".codex"), "skills");
const force = process.argv.includes("--force");
mkdirSync(target, { recursive: true });
for (const name of (await import("node:fs")).readdirSync(path.join(root, "skills"))) {
  const source = path.join(root, "skills", name);
  const link = path.join(target, name);
  if (existsSync(link) || (() => { try { lstatSync(link); return true; } catch { return false; } })()) {
    const same = lstatSync(link).isSymbolicLink() && path.resolve(path.dirname(link), readlinkSync(link)) === source;
    if (same) { console.log(`ok ${name}`); continue; }
    if (!force) throw new Error(`${link} 已存在；确认替换后使用 --force`);
    if (!lstatSync(link).isSymbolicLink()) throw new Error(`${link} 不是符号链接，拒绝删除`);
    unlinkSync(link);
  }
  symlinkSync(source, link, "dir");
  console.log(`installed ${name}`);
}

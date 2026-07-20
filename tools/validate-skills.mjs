#!/usr/bin/env node
/** 校验全部 Skill 元数据、界面元数据、知识原子和 JSON 资源。 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

function filesUnder(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(file) : [file];
  });
}

function frontmatter(text, file) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) throw new Error(`${file}: 缺少 YAML frontmatter`);
  const data = {};
  for (const line of match[1].split("\n")) {
    const field = line.match(/^([a-z_]+):\s*(.*)$/);
    if (!field) throw new Error(`${file}: frontmatter 只支持单行字段`);
    data[field[1]] = field[2].replace(/^['"]|['"]$/g, "");
  }
  return data;
}

export function validateRepository(root = ROOT) {
  const errors = [];
  const skillRoot = path.join(root, "skills");
  const skills = readdirSync(skillRoot).filter((name) => statSync(path.join(skillRoot, name)).isDirectory()).sort();
  for (const name of skills) {
    const file = path.join(skillRoot, name, "SKILL.md");
    try {
      const data = frontmatter(readFileSync(file, "utf8"), file);
      if (Object.keys(data).sort().join(",") !== "description,name") errors.push(`${name}: frontmatter 只能包含 name 和 description`);
      if (data.name !== name) errors.push(`${name}: name 与目录不一致`);
      if (!/^[a-z0-9-]{1,63}$/.test(data.name || "")) errors.push(`${name}: name 格式不合法`);
      if (!(data.description || "").trim()) errors.push(`${name}: description 为空`);
      const interfaceText = readFileSync(path.join(skillRoot, name, "agents", "openai.yaml"), "utf8");
      if (!/display_name:\s*".+"/.test(interfaceText)) errors.push(`${name}: openai.yaml 缺 display_name`);
      if (!interfaceText.includes(`$${name}`)) errors.push(`${name}: default_prompt 未调用 $${name}`);
    } catch (error) { errors.push(error.message); }
  }

  for (const file of filesUnder(path.join(root, "evals")).filter((file) => file.endsWith(".json"))) {
    try { JSON.parse(readFileSync(file, "utf8")); } catch (error) { errors.push(`${file}: ${error.message}`); }
  }
  const atomFile = path.join(root, "知识库", "原子库", "atoms.jsonl");
  const ids = new Set();
  readFileSync(atomFile, "utf8").trim().split("\n").forEach((line, index) => {
    try {
      const atom = JSON.parse(line);
      for (const field of ["id", "knowledge", "type", "topics", "source", "confidence"]) if (atom[field] === undefined) errors.push(`atoms.jsonl:${index + 1} 缺字段 ${field}`);
      if (ids.has(atom.id)) errors.push(`atoms.jsonl:${index + 1} id 重复 ${atom.id}`);
      ids.add(atom.id);
    } catch (error) { errors.push(`atoms.jsonl:${index + 1} ${error.message}`); }
  });
  const router = readFileSync(path.join(skillRoot, "course-producer", "SKILL.md"), "utf8");
  for (const name of skills.filter((name) => name !== "course-producer")) if (!router.includes(`\`${name}\``)) errors.push(`主路由缺少 ${name}`);
  return { valid: errors.length === 0, skills: skills.length, atoms: ids.size, errors };
}

if (process.argv[1] && import.meta.url === new URL(`file://${path.resolve(process.argv[1])}`).href) {
  const result = validateRepository(process.argv[2] || ROOT);
  console.log(JSON.stringify(result, null, 2));
  if (!result.valid) process.exitCode = 1;
}

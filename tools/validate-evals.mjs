#!/usr/bin/env node
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = path.resolve(process.argv[2] || ".");
const files = readdirSync(path.join(root, "evals")).filter((name) => name.endsWith(".json"));
const errors = [];
let scenarios = 0;
for (const name of files) {
  try {
    const data = JSON.parse(readFileSync(path.join(root, "evals", name), "utf8"));
    if (!Array.isArray(data.scenarios) || !data.scenarios.length) errors.push(`${name}: scenarios 为空`);
    for (const scenario of data.scenarios || []) {
      scenarios += 1;
      if (!scenario.id || !scenario.prompt || !Array.isArray(scenario.assertions) || !scenario.assertions.length) errors.push(`${name}: 场景字段不完整`);
    }
  } catch (error) { errors.push(`${name}: ${error.message}`); }
}
const result = { valid: !errors.length, files: files.length, scenarios, errors };
console.log(JSON.stringify(result, null, 2));
if (!result.valid) process.exitCode = 1;

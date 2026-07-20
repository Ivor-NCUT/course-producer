import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { lintFile } from "../tools/course-lint.mjs";

test("扫描具体坏味道、字幕段落和无来源百分比", () => {
  const root = mkdtempSync(path.join(tmpdir(), "course-lint-"));
  const file = path.join(root, "lesson.md");
  try {
    writeFileSync(file, "随着行业的发展，这件事至关重要。\n\n他发过帖。\n\n他评论过。\n\n他提过 issue。\n\n转化率达到 80%。\n");
    const issues = lintFile(file);
    assert.ok(issues.some((item) => item.category === "ai_smell"));
    assert.ok(issues.some((item) => item.category === "spoken_flow"));
    assert.ok(issues.some((item) => item.category === "unsupported_claim" && item.action === "needs_evidence"));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("带来源提示的数字不报 unsupported_claim", () => {
  const root = mkdtempSync(path.join(tmpdir(), "course-lint-"));
  const file = path.join(root, "lesson.md");
  try {
    writeFileSync(file, "样本转化率为 80%。（来源：source_id src-01）\n");
    assert.equal(lintFile(file).filter((item) => item.category === "unsupported_claim").length, 0);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

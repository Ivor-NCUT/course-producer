import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { checkpoint, CourseProjectError, initProject, resumeProject, verifyProject } from "../tools/course-project.mjs";

const project = (fn) => {
  const root = mkdtempSync(path.join(tmpdir(), "course-producer-"));
  try { fn(root); } finally { rmSync(root, { recursive: true, force: true }); }
};

test("初始化后从 intake 恢复", () => project((root) => {
  initProject(root, "样例课");
  assert.equal(resumeProject(root).resume_stage, "intake");
}));

test("合法迁移、完成验证与指纹变化检测", () => project((root) => {
  initProject(root);
  const artifact = path.join(root, ".course-producer/artifacts/intake-report.md");
  mkdirSync(path.dirname(artifact), { recursive: true });
  writeFileSync(artifact, "ok");
  checkpoint(root, { stage: "intake", status: "in_progress" });
  checkpoint(root, { stage: "intake", status: "completed", artifacts: [".course-producer/artifacts/intake-report.md"], checks: ["schema-ok"] });
  assert.equal(resumeProject(root).resume_stage, "positioning");
  writeFileSync(artifact, "changed");
  assert.match(verifyProject(root).errors[0], /产物指纹变化/);
}));

test("拒绝非法迁移和缺少产物的完成状态", () => project((root) => {
  initProject(root);
  assert.throws(() => checkpoint(root, { stage: "intake", status: "completed" }), CourseProjectError);
  checkpoint(root, { stage: "intake", status: "in_progress" });
  assert.throws(() => checkpoint(root, { stage: "intake", status: "completed", artifacts: ["missing.md"], checks: ["ok"] }), /产物不存在/);
}));

test("拒绝静默替换已确认产物", () => project((root) => {
  initProject(root);
  writeFileSync(path.join(root, "result.md"), "v1");
  checkpoint(root, { stage: "intake", status: "in_progress" });
  checkpoint(root, { stage: "intake", status: "completed", artifacts: ["result.md"], checks: ["reviewed"] });
  writeFileSync(path.join(root, "result.md"), "v2");
  assert.throws(() => checkpoint(root, { stage: "intake", status: "completed", artifacts: ["result.md"], checks: ["reviewed"] }), /--force/);
}));

import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { runOfflineSample } from "../tools/run-offline-sample.mjs";

test("离线样例完成核心生产链并通过完整性审计", () => {
  const root = mkdtempSync(path.join(tmpdir(), "course-producer-e2e-"));
  try {
    const report = runOfflineSample(root);
    assert.equal(report.verification.valid, true);
    assert.equal(report.verification.complete, true);
    assert.equal(report.artifacts.length, 8);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

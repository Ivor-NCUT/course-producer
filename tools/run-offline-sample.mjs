#!/usr/bin/env node
/** 运行离线样例，验证完整核心阶段、检查点与产物清单。 */

import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { checkpoint, initProject, verifyProject } from "./course-project.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

export function runOfflineSample(output) {
  output = path.resolve(output);
  mkdirSync(output, { recursive: true });
  initProject(output, "阻塞优先周会（离线协议样例）");
  const store = path.join(output, ".course-producer");
  const sample = path.join(ROOT, "examples", "offline-course");
  cpSync(path.join(sample, "materials"), path.join(output, "materials"), { recursive: true });
  cpSync(path.join(sample, "artifacts"), path.join(store, "artifacts"), { recursive: true });
  writeFileSync(path.join(store, "materials.jsonl"), `${JSON.stringify({ source_id: "src-001", source_type: "local_markdown", location: "materials/expert-interview.md", fingerprint: "fixture", status: "ready", classification: "course_material", purposes: ["positioning", "knowledge_extraction", "lesson_writing"], evidence_locator: "line:1-7" })}\n`);

  const complete = (stage, artifacts) => {
    checkpoint(output, { stage, status: "in_progress" });
    checkpoint(output, { stage, status: "completed", artifacts, inputs: stage === "intake" ? ["materials/expert-interview.md"] : [], checks: ["offline-fixture-reviewed"] });
  };
  complete("intake", [".course-producer/materials.jsonl", ".course-producer/artifacts/material-gap-report.md"]);
  complete("positioning", [".course-producer/artifacts/positioning.md"]);
  complete("interview_design", [".course-producer/artifacts/interview-guide.md"]);
  complete("knowledge_extraction", [".course-producer/artifacts/knowledge-cards.jsonl"]);
  complete("outline", [".course-producer/artifacts/course-blueprint.md"]);
  complete("lesson_writing", [".course-producer/artifacts/lessons/01-meeting-actions.md"]);
  complete("quality_review", [".course-producer/artifacts/review.jsonl"]);
  checkpoint(output, { stage: "lark_delivery", status: "skipped", nextAction: "离线样例不写飞书" });
  checkpoint(output, { stage: "poster_planning", status: "skipped", nextAction: "离线样例不做海报" });
  const audit = {
    sample: "offline-course",
    required_artifacts: ["materials.jsonl", "material-gap-report.md", "positioning.md", "interview-guide.md", "knowledge-cards.jsonl", "course-blueprint.md", "lessons/01-meeting-actions.md", "review.jsonl"],
    note: "该样例验证状态与产物协议；内容质量由 evals 场景评测。",
  };
  writeFileSync(path.join(store, "artifacts", "completion-audit.json"), `${JSON.stringify(audit, null, 2)}\n`);
  complete("completion_audit", [".course-producer/artifacts/completion-audit.json"]);
  const verification = verifyProject(output, true);
  if (!verification.valid || !verification.complete) throw new Error(JSON.stringify(verification));
  return { output, verification, artifacts: audit.required_artifacts };
}

if (process.argv[1] && import.meta.url === new URL(`file://${path.resolve(process.argv[1])}`).href) {
  const outputIndex = process.argv.indexOf("--output");
  const output = outputIndex >= 0 ? process.argv[outputIndex + 1] : path.join(ROOT, "dist", "offline-sample");
  console.log(JSON.stringify(runOfflineSample(output), null, 2));
}

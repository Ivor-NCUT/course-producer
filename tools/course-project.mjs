#!/usr/bin/env node
/** Course Producer 本地项目状态机。仅使用 Node.js 标准库。 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

export const PHASES = [
  "intake", "positioning", "interview_design", "knowledge_extraction", "outline",
  "lesson_writing", "quality_review", "lark_delivery", "poster_planning", "completion_audit",
];
const STATUSES = new Set(["pending", "in_progress", "completed", "blocked", "skipped"]);
const TRANSITIONS = {
  pending: new Set(["in_progress", "skipped"]),
  in_progress: new Set(["completed", "blocked", "skipped"]),
  blocked: new Set(["in_progress", "skipped"]),
  completed: new Set(),
  skipped: new Set(),
};

export class CourseProjectError extends Error {}

const now = () => new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
const storeFor = (root) => path.join(path.resolve(root), ".course-producer");

function readJson(file) {
  if (!existsSync(file)) throw new CourseProjectError(`项目尚未初始化：缺少 ${file}`);
  try { return JSON.parse(readFileSync(file, "utf8")); }
  catch (error) { throw new CourseProjectError(`状态文件不是合法 JSON：${file}: ${error.message}`); }
}

function writeJson(file, data) {
  mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp`;
  writeFileSync(temp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  renameSync(temp, file);
}

function fingerprint(file) {
  return `sha256:${createHash("sha256").update(readFileSync(file)).digest("hex")}`;
}

const initialStage = () => ({
  status: "pending", input_fingerprints: {}, artifacts: [], checks: [], blockers: [],
  updated_at: null, next_action: null,
});

export function initProject(root, name = null) {
  root = path.resolve(root);
  const store = storeFor(root);
  if (existsSync(path.join(store, "state.json"))) throw new CourseProjectError(`项目已初始化：${store}`);
  mkdirSync(path.join(store, "artifacts", "lessons"), { recursive: true });
  writeFileSync(path.join(store, "materials.jsonl"), "", { flag: "a" });
  writeFileSync(path.join(store, "decisions.jsonl"), "", { flag: "a" });
  const timestamp = now();
  const project = { schema_version: 1, name: name || path.basename(root), project_root: root, created_at: timestamp, updated_at: timestamp };
  const state = { schema_version: 1, current_stage: PHASES[0], stages: Object.fromEntries(PHASES.map((phase) => [phase, initialStage()])), updated_at: timestamp };
  writeJson(path.join(store, "project.json"), project);
  writeJson(path.join(store, "state.json"), state);
  return { project, state };
}

function loadState(root) {
  const store = storeFor(root);
  const state = readJson(path.join(store, "state.json"));
  if (!state.stages || PHASES.some((phase) => !state.stages[phase])) throw new CourseProjectError("state.json 缺少完整阶段定义");
  return { store, state };
}

function resolveProjectFile(root, rawPath, label) {
  const resolvedRoot = path.resolve(root);
  const absolute = path.resolve(resolvedRoot, rawPath);
  if (absolute !== resolvedRoot && !absolute.startsWith(`${resolvedRoot}${path.sep}`)) throw new CourseProjectError(`${label}必须位于课程项目内：${rawPath}`);
  if (!existsSync(absolute) || !statSync(absolute).isFile()) throw new CourseProjectError(`${label}不存在或不是文件：${rawPath}`);
  return { path: path.relative(resolvedRoot, absolute).split(path.sep).join("/"), absolute };
}

export function nextStage(state) {
  return PHASES.find((phase) => !["completed", "skipped"].includes(state.stages[phase].status)) || "done";
}

export function checkpoint(root, options) {
  const { stage, status, artifacts = [], inputs = [], checks = [], blockers = [], nextAction = null, force = false } = options;
  if (!PHASES.includes(stage)) throw new CourseProjectError(`未知阶段：${stage}`);
  if (!STATUSES.has(status)) throw new CourseProjectError(`未知状态：${status}`);
  const { store, state } = loadState(root);
  const record = state.stages[stage];
  if (!force && status !== record.status && !TRANSITIONS[record.status].has(status)) throw new CourseProjectError(`非法状态迁移：${stage} ${record.status} -> ${status}`);

  const artifactRecords = new Map(record.artifacts.map((item) => [item.path, item]));
  for (const rawPath of artifacts) {
    const file = resolveProjectFile(root, rawPath, "产物");
    const item = { path: file.path, fingerprint: fingerprint(file.absolute) };
    const previous = artifactRecords.get(file.path);
    if (previous && previous.fingerprint !== item.fingerprint && !force) throw new CourseProjectError(`已登记产物发生变化，使用 --force 才能重验：${file.path}`);
    artifactRecords.set(file.path, item);
  }
  const inputFingerprints = { ...record.input_fingerprints };
  for (const rawPath of inputs) {
    const file = resolveProjectFile(root, rawPath, "输入");
    inputFingerprints[file.path] = fingerprint(file.absolute);
  }
  if (status === "completed") {
    if (!artifactRecords.size) throw new CourseProjectError("完成阶段前必须登记至少一个真实产物");
    if (!checks.length) throw new CourseProjectError("完成阶段前必须登记至少一项验证结果");
    if (blockers.length) throw new CourseProjectError("存在阻塞项时不能标记完成");
  }
  const timestamp = now();
  Object.assign(record, { status, input_fingerprints: inputFingerprints, artifacts: [...artifactRecords.values()], checks: checks.length ? checks : record.checks, blockers, updated_at: timestamp, next_action: nextAction });
  state.current_stage = nextStage(state);
  state.updated_at = timestamp;
  writeJson(path.join(store, "state.json"), state);
  return record;
}

function validateStageFiles(root, record) {
  const errors = [];
  for (const item of record.artifacts || []) {
    try {
      const file = resolveProjectFile(root, item.path, "产物");
      if (fingerprint(file.absolute) !== item.fingerprint) errors.push(`产物指纹变化：${item.path}`);
    } catch { errors.push(`产物缺失：${item.path}`); }
  }
  for (const [rawPath, expected] of Object.entries(record.input_fingerprints || {})) {
    try {
      const file = resolveProjectFile(root, rawPath, "输入");
      if (fingerprint(file.absolute) !== expected) errors.push(`输入指纹变化：${rawPath}`);
    } catch { errors.push(`输入缺失：${rawPath}`); }
  }
  if (record.status === "completed" && !(record.checks || []).length) errors.push("完成阶段没有验证记录");
  return errors;
}

export function projectStatus(root) {
  const { state } = loadState(root);
  return {
    current_stage: nextStage(state),
    stages: Object.fromEntries(PHASES.map((phase) => {
      const errors = validateStageFiles(root, state.stages[phase]);
      return [phase, { status: state.stages[phase].status, valid: !errors.length, errors, next_action: state.stages[phase].next_action }];
    })),
  };
}

export function resumeProject(root) {
  const report = projectStatus(root);
  for (const phase of PHASES) {
    const stage = report.stages[phase];
    if (stage.status === "completed" && !stage.valid) return { resume_stage: phase, reason: "已完成阶段的输入或产物需要重验", ...stage };
    if (!["completed", "skipped"].includes(stage.status)) return { resume_stage: phase, reason: "第一个未完成阶段", ...stage };
  }
  return { resume_stage: "done", reason: "所有阶段均已完成或跳过" };
}

export function verifyProject(root, requireComplete = false) {
  const report = projectStatus(root);
  const errors = [];
  for (const [phase, stage] of Object.entries(report.stages)) {
    errors.push(...stage.errors.map((message) => `${phase}: ${message}`));
    if (requireComplete && !["completed", "skipped"].includes(stage.status)) errors.push(`${phase}: 阶段尚未完成`);
  }
  return { valid: !errors.length, complete: report.current_stage === "done", errors };
}

function parseArgs(argv) {
  let root = ".";
  const args = [...argv];
  const rootIndex = args.indexOf("--root");
  if (rootIndex >= 0) { root = args[rootIndex + 1]; args.splice(rootIndex, 2); }
  const command = args.shift();
  const takeMany = (flag) => args.flatMap((value, index) => value === flag ? [args[index + 1]] : []);
  const takeOne = (flag) => { const index = args.indexOf(flag); return index >= 0 ? args[index + 1] : null; };
  return { root, command, stage: takeOne("--stage"), status: takeOne("--status"), artifacts: takeMany("--artifact"), inputs: takeMany("--input"), checks: takeMany("--check"), blockers: takeMany("--blocker"), nextAction: takeOne("--next-action"), name: takeOne("--name"), force: args.includes("--force"), requireComplete: args.includes("--require-complete") };
}

if (process.argv[1] && import.meta.url === new URL(`file://${path.resolve(process.argv[1])}`).href) {
  try {
    const options = parseArgs(process.argv.slice(2));
    let result;
    if (options.command === "init") result = initProject(options.root, options.name);
    else if (options.command === "status") result = projectStatus(options.root);
    else if (options.command === "resume") result = resumeProject(options.root);
    else if (options.command === "verify") result = verifyProject(options.root, options.requireComplete);
    else if (options.command === "checkpoint") result = checkpoint(options.root, options);
    else throw new CourseProjectError("用法：course-project.mjs --root <目录> init|status|checkpoint|resume|verify");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }));
    process.exitCode = 2;
  }
}

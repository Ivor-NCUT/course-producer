#!/usr/bin/env node
/** 无外部依赖构建并解压校验完整套件与独立 Skill ZIP。 */

import { deflateRawSync, inflateRawSync } from "node:zlib";
import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const CRC_TABLE = Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let i = 0; i < 8; i += 1) crc = (crc & 1) ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  return crc >>> 0;
});
const crc32 = (data) => {
  let crc = 0xffffffff;
  for (const byte of data) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};

function collect(dir, prefix = "") {
  return readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    const name = path.posix.join(prefix, entry.name);
    return entry.isDirectory() ? collect(file, name) : [{ name, data: readFileSync(file) }];
  });
}

function header(size) { return Buffer.alloc(size); }

export function writeZip(entries, output) {
  const local = [];
  const central = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name, "utf8");
    const data = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data);
    const compressed = deflateRawSync(data, { level: 9 });
    const crc = crc32(data);
    const localHeader = header(30);
    localHeader.writeUInt32LE(0x04034b50, 0); localHeader.writeUInt16LE(20, 4); localHeader.writeUInt16LE(0x800, 6);
    localHeader.writeUInt16LE(8, 8); localHeader.writeUInt32LE(crc, 14); localHeader.writeUInt32LE(compressed.length, 18);
    localHeader.writeUInt32LE(data.length, 22); localHeader.writeUInt16LE(name.length, 26);
    local.push(localHeader, name, compressed);
    const centralHeader = header(46);
    centralHeader.writeUInt32LE(0x02014b50, 0); centralHeader.writeUInt16LE(20, 4); centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x800, 8); centralHeader.writeUInt16LE(8, 10); centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(compressed.length, 20); centralHeader.writeUInt32LE(data.length, 24); centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt32LE(offset, 42);
    central.push(centralHeader, name);
    offset += localHeader.length + name.length + compressed.length;
  }
  const centralData = Buffer.concat(central);
  const end = header(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralData.length, 12); end.writeUInt32LE(offset, 16);
  mkdirSync(path.dirname(output), { recursive: true });
  writeFileSync(output, Buffer.concat([...local, centralData, end]));
}

export function verifyZip(file) {
  const zip = readFileSync(file);
  let cursor = 0;
  let count = 0;
  while (cursor + 4 <= zip.length && zip.readUInt32LE(cursor) === 0x04034b50) {
    const method = zip.readUInt16LE(cursor + 8);
    const crc = zip.readUInt32LE(cursor + 14);
    const compressedSize = zip.readUInt32LE(cursor + 18);
    const size = zip.readUInt32LE(cursor + 22);
    const nameSize = zip.readUInt16LE(cursor + 26);
    const extraSize = zip.readUInt16LE(cursor + 28);
    const start = cursor + 30 + nameSize + extraSize;
    const compressed = zip.subarray(start, start + compressedSize);
    const data = method === 8 ? inflateRawSync(compressed) : compressed;
    if (data.length !== size || crc32(data) !== crc) throw new Error(`${file}: ZIP entry 校验失败`);
    cursor = start + compressedSize;
    count += 1;
  }
  if (!count || !zip.includes(Buffer.from("PK\x05\x06", "binary"))) throw new Error(`${file}: ZIP 目录缺失`);
  return count;
}

export function build(root = ROOT) {
  const dist = path.join(root, "dist");
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(path.join(dist, "skills"), { recursive: true });
  const excluded = new Set([".git", "dist", ".course-producer"]);
  const suiteEntries = readdirSync(root, { withFileTypes: true }).filter((entry) => !excluded.has(entry.name)).flatMap((entry) => {
    const file = path.join(root, entry.name);
    return entry.isDirectory() ? collect(file, `course-producer-suite/${entry.name}`) : [{ name: `course-producer-suite/${entry.name}`, data: readFileSync(file) }];
  });
  const suite = path.join(dist, "course-producer-suite.zip");
  writeZip(suiteEntries, suite);
  const reports = [{ file: path.relative(root, suite), entries: verifyZip(suite) }];
  const knowledgeEntries = collect(path.join(root, "知识库"), "references/知识库");
  for (const name of readdirSync(path.join(root, "skills")).sort()) {
    const skillDir = path.join(root, "skills", name);
    if (!statSync(skillDir).isDirectory()) continue;
    const entries = collect(skillDir, name).map((entry) => entry.name === `${name}/SKILL.md`
      ? { ...entry, data: Buffer.from(entry.data.toString("utf8").replaceAll("知识库/", "references/知识库/")) }
      : entry);
    entries.push(...knowledgeEntries.map((entry) => ({ ...entry, name: `${name}/${entry.name}` })));
    const output = path.join(dist, "skills", `${name}.zip`);
    writeZip(entries, output);
    reports.push({ file: path.relative(root, output), entries: verifyZip(output) });
  }
  writeFileSync(path.join(dist, "build-manifest.json"), `${JSON.stringify({ generated_at: new Date().toISOString(), artifacts: reports }, null, 2)}\n`);
  return reports;
}

if (process.argv[1] && import.meta.url === new URL(`file://${path.resolve(process.argv[1])}`).href) console.log(JSON.stringify(build(process.argv[2] || ROOT), null, 2));

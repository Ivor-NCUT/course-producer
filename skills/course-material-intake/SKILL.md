---
name: course-material-intake
description: 课程材料盘点与证据化摄取。扫描本地课程目录、飞书文档或 Wiki、飞书妙记转录、PDF、Word、Markdown、音视频转写和已有课程稿，生成可追溯的 materials.jsonl 与材料缺口报告。Use when the user says 盘点课程材料、读取课程素材、整理访谈文件、建立材料清单、检查哪些资料能用，或 Course Producer 进入 intake 阶段。
---

# 课程材料摄取

只建立材料证据索引与可读性缺口，不在本阶段确定课程定位、课纲或正文。

## 输入与工具路由

读取用户给出的项目目录、文件和 URL。优先复用已安装工具：

- PDF、DOCX、表格、音视频分别调用对应文件 Skill；不要自建通用解析器。
- 飞书 Wiki 先解析真实对象，再用 `lark-doc` / `lark-drive` 读取。
- 飞书妙记用 `lark-minutes` 获取 transcript；摘要和关键词只用于导航。
- 无法读取的来源保留原路径或 URL，状态写为 `blocked`，记录真实错误，不猜内容。

## 执行流程

1. 确认课程项目已经用 `tools/course-project.mjs init` 初始化；未初始化则先初始化。
2. 递归盘点用户明确放入范围的文件，排除 `.course-producer/`、版本库、缓存和构建产物。
3. 为每个来源生成稳定 `source_id`，计算本地文件 SHA-256；远程对象优先记录对象 token、版本或更新时间，无法取得时记录 `fingerprint: null`。
4. 读取可读正文并分类，分类只能是：
   - `execution_instruction`：给 Agent 的执行约束，不进入学员正文；
   - `course_material`：观点、方法、案例、数据、故事、原话和教学决策；
   - `meeting_chatter`：问候、排期、掉线和无关闲聊；
   - `unreadable`：缺权限、损坏、格式不支持或内容缺失。
5. 判断每个来源可用于定位、访谈、知识萃取、课纲、逐字稿、审校或海报中的哪些阶段。
6. 把一行一个 JSON 对象追加或幂等更新到 `.course-producer/materials.jsonl`。同一 `source_id + fingerprint` 不重复写入。
7. 在 `.course-producer/artifacts/material-gap-report.md` 汇总可用材料、冲突、重复、不可读项和后续阶段真正缺少的证据。
8. 用状态工具把 intake 标记完成，登记 `materials.jsonl` 与缺口报告、输入指纹和验证结果。

## materials.jsonl 契约

每条记录至少包含：

```json
{"source_id":"src-001","source_type":"minutes_transcript","location":"https://...","title":"专家访谈","fingerprint":"sha256:...","status":"ready","classification":"course_material","purposes":["knowledge_extraction","lesson_writing"],"evidence_locator":"00:12:40-00:18:05","notes":null}
```

- `status`：`ready`、`partial`、`blocked`、`ignored`。
- `source_type`：写真实类型，如 `local_markdown`、`pdf`、`docx`、`audio`、`minutes_transcript`、`lark_doc`。
- `evidence_locator`：页码、段落标题、时间戳或 block id；暂时未知可为 `null`，后续抽取时补齐。
- 记录错误时使用 `error.code` 和 `error.message`，不要记录凭据。

## 完成检查

- 所有用户指定来源都已登记，数量能与原始输入对上。
- 每条记录都有来源、类型、位置、状态、分类和用途。
- transcript 与摘要没有混用；执行指令和会议闲聊没有进入课程素材。
- 不可读项全部进入缺口报告，错误可复现。
- `materials.jsonl` 每行都是合法 JSON，且没有重复的 `source_id + fingerprint`。

完成后只交付材料索引与缺口报告，把下一阶段交给 `course-positioning`。

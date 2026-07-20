---
name: course-quality-editor
description: 对整门课程和单章执行认知交付、模块顺序、逻辑连续、信息密度、口播节奏、事实证据与 AI 写作坏味道审校，生成 review.jsonl 和保留讲师立场的修订稿。Use when the user says 课程审校、检查课程逻辑、去 AI 味、检查逐字稿、精修课程、检查事实证据，或 Course Producer 进入 quality_review 阶段。
---

# 课程质量审校

围绕已有稿件审校和修订，不另起炉灶重写整门课。开始前读取课程定位、蓝图、知识卡、全部章节，以及 `知识库/方法论/课程审校.md`。

## 审校顺序

1. 运行 `node tools/course-lint.mjs <lessons-dir> --output <review.jsonl>`，得到可复现的禁用句式、模板转场、字幕式断行和证据提示。
2. 做课程级检查：模块是否按学习成果排序，第一、第二模块能否独立交付结果，章节是否螺旋复用，承诺是否越过定位边界。
3. 做章节级检查：教学任务、认知起终点、挑战情境、段落到段落的因果/动作连接、信息密度、术语解释和前后桥接。
4. 核查事实证据：数字、案例、背书、高风险承诺是否对应 `knowledge_card_id` 与来源；找不到时标为补材料，不能润色成确定事实。
5. 对每个问题选择动作：
   - `auto_fix`：不改变观点的措辞、重复、缺桥接、段落节奏与明确格式问题；
   - `needs_evidence`：缺数据、案例、授权或原始来源；
   - `needs_decision`：课程承诺、品牌立场、目标人群、价格、公开风险或证据冲突需要用户判断。
6. 先复制原稿到 `.course-producer/artifacts/revised-lessons/` 再应用 `auto_fix`。不覆盖已确认原稿，除非用户明确要求原位修改。
7. 把所有发现逐行写入 `.course-producer/artifacts/review.jsonl`；修复后更新 `status` 与 `revision_locator`，保留问题原始证据。
8. 重新运行确定性扫描并做课程级复核。高风险问题未解决时不能把 quality_review 标记完成。

## review.jsonl 契约

```json
{"review_id":"rev-001","scope":"lesson","artifact":"lessons/01.md","locator":"## 方法","category":"logic_gap","severity":"high","evidence":"上一段产物没有进入本段动作","action":"auto_fix","status":"fixed","suggestion":"补充产物到动作的桥接","revision_locator":"revised-lessons/01.md#方法"}
```

`category` 可使用 `course_order`、`logic_gap`、`repetition`、`density`、`spoken_flow`、`ai_smell`、`unexplained_term`、`unsupported_claim`、`position_conflict`。不要输出主观“AI 概率”。

## 保真边界

- 可以改结构、顺序、句群、转场、重复和术语解释。
- 不改变讲师观点、战略立场、案例因果、数字口径和课程承诺。
- 对观点有疑问时写 `needs_decision`，不要用审校者立场替换。
- 逐字原话只在确认是引用错误时改；普通口语不因“不够精致”被抹平。

## 完成检查

- 课程级与章节级审校都已执行。
- review 每条有位置、具体证据、严重度、动作和状态。
- 自动修复后的稿件可回放，原稿仍可恢复。
- 数字、案例、背书和高风险承诺有来源或明确待补。
- 没有用概率分数代替具体文本证据。
- 修订没有改变讲师观点和战略立场。

完成后可进入 `course-lark-delivery`；用户对修订结果反馈时按审美对齐入口处理。

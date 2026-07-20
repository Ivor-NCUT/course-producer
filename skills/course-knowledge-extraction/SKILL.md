---
name: course-knowledge-extraction
description: 从访谈转录、课程文件和 materials.jsonl 中提取带证据位置的观点、方法、步骤、案例、数据、边界与讲师原话，生成 knowledge-cards.jsonl。Use when the user says 知识萃取、提取课程知识卡、整理专家经验、把访谈变成可用素材，或 Course Producer 进入 knowledge_extraction 阶段。
---

# 课程知识萃取

只生成证据化知识卡，不设计模块顺序，不写完整课程正文。

开始前读取 `materials.jsonl`、定位、访谈记录，以及 `知识库/方法论/知识萃取.md` 和 `知识库/模板/知识卡模板.json`。

## 执行流程

1. 按材料记录读取 `course_material`，跳过执行指令和会议闲聊；不可读项沿用 blocker。
2. 以最小完整含义为单位提取知识卡，类型只能是 `viewpoint`、`method`、`step`、`case`、`data`、`boundary`、`verbatim`、`claim_to_verify`。
3. 每张卡保留 `source_id` 与可回到原文的 `evidence_locator`：页码、时间戳、标题路径或 block id。不要只写文件名。
4. 区分原话与改写：`verbatim` 必须逐字且注明 speaker；其他卡用 `summary`，不要把润色后的句子冒充原话。
5. 事实、数字和背书缺少可核证来源时转为 `claim_to_verify`；讲师观点可以以其原话为证据，但不能证明外部事实。
6. 为方法卡补齐适用场景、输入、步骤、输出、完成标准和失败边界。原材料没有的字段标为 `unknown`，不补造。
7. 合并语义重复卡时保留全部证据；互相冲突的卡不得合并，设置同一 `conflict_group`。
8. 输出 `.course-producer/artifacts/knowledge-cards.jsonl`，逐行校验 JSON、唯一 id、来源和定位符。

## 完成检查

- 观点、方法、步骤、案例、数据、边界和高价值原话均已覆盖或在缺口中说明。
- 所有卡都能从 `source_id + evidence_locator` 回到原始证据。
- 无来源的事实主张没有混入 data 卡。
- 方法卡没有把未知步骤补成常识答案。
- 冲突、重复和待验证状态可见。

完成后把知识卡交给 `course-outline-design`。

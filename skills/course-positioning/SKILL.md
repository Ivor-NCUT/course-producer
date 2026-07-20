---
name: course-positioning
description: 基于课程材料或必要的最少提问，生成可验证的课程定位：课程主题、目标学员、挑战情境、学习成果、使用场景和边界。Use when the user says 课程定位、这门课给谁学、课程解决什么问题、课程承诺、从零设计课程，或 Course Producer 完成材料摄取后进入 positioning 阶段。
---

# 课程定位

只确定课程方向，不生成课纲或逐字稿。优先读取证据，信息够用就直接推进；不要把访谈流程当成必须经过的仪式。

开始前读取：

- `.course-producer/materials.jsonl`
- `.course-producer/artifacts/material-gap-report.md`
- `知识库/方法论/课程定位.md`
- `知识库/模板/课程项目模板.md`

## 执行流程

1. 从材料提取已经明确的课程主题、受众背景、迫切问题、应用场景、约束、讲师优势和结果承诺。
2. 把互相冲突的证据分开列出，不自行选择。向 `.course-producer/decisions.jsonl` 追加决策项，记录来源、影响阶段和建议选项。
3. 用“具体的人与环境 + 正在发生的问题 + 时间/资源/能力约束”写挑战情境，拒绝“提升认知”“学会增长”一类空泛表述。
4. 把学习成果写成可观察行为或产物：学员在什么场景下，能完成什么任务，达到什么判定标准。
5. 判断信息是否足够：
   - 缺口不会改变目标学员、课程承诺或边界时，标为待确认并继续；
   - 缺口会让课程变成另一门课时，只问一个当前最关键的问题；
   - 用户已经授权长时执行时，不重复要求确认已有事实。
6. 生成 `.course-producer/artifacts/positioning.md`，每个重要判断附 `source_id`；用户口头新增信息用 `source_id: user-decision-*` 登记到 decisions。
7. 运行定位质量检查，写入检查结果并登记阶段完成。

## 输出结构

```markdown
# 课程定位

## 一句话主题
## 目标学员
- 已有背景
- 当前场景
- 排除人群

## 核心挑战
- 场景
- 问题
- 约束

## 学习成果
- 成果 / 使用场景 / 验收标准

## 课程使用场景
## 课程边界与不承诺
## 证据与待确认项
```

## 决策记录

`decisions.jsonl` 每项至少包含 `decision_id`、`question`、`options`、`evidence`、`impact`、`status` 和 `resolution`。`status` 使用 `open` 或 `resolved`。不要把普通材料缺口升级成用户决策。

## 完成检查

- 主题、目标学员、挑战、学习成果、使用场景和边界齐全。
- 挑战同时包含场景、问题和约束。
- 学习成果可观察、可验收，没有编造量化承诺。
- 每个关键判断有来源或明确标为用户决定/待确认。
- 材料矛盾已进入 `decisions.jsonl`，没有被静默抹平。
- 文档没有提前设计课程模块、章节或完整正文。

完成后把定位交给 `course-interview-design` 或 `course-knowledge-extraction`。

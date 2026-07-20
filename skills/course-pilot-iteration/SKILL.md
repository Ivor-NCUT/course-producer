---
name: course-pilot-iteration
description: 用真实试讲、作业、提问和学员反馈迭代课程。建立最小试讲计划，区分事实、学员原话与解释，记录修订假设、观察指标、结果回填和版本决定。Use when the user says 课程试讲、内测课程、学员反馈、根据第一期反馈改课、复盘完课率、迭代下一版课程，或 Course Producer 需要在正式发布前后验证教学效果。
---

# 课程试讲与迭代

只负责用真实学习反馈验证和修改课程，不替代课程定位、逐字稿写作、审校或内容审美对齐。没有真实试讲证据时，可以设计试讲，但不能声称已经验证教学效果。

开始前按需读取：

- `.course-producer/artifacts/positioning.md`
- `.course-producer/artifacts/course-blueprint.md`
- 本轮试讲涉及的 `lessons/*.md`
- `.course-producer/artifacts/review.jsonl`
- `知识库/方法论/课程试讲与迭代.md`
- `知识库/模板/试讲反馈记录模板.md`

## 识别运行模式

| 当前输入 | 模式 | 结果 |
|---|---|---|
| 只有课程稿，没有试讲数据 | 试讲设计 | 最小试讲单元、假设、观察点和反馈入口 |
| 有问卷、作业、聊天或访谈 | 反馈归档 | 证据化反馈记录与问题聚类 |
| 有旧版、新版和结果 | 结果回填 | 判断修改是否有效，保留或撤回改动 |
| 用户只说“学员觉得不好” | 证据缺口 | 记录低置信信号，提出最小取证动作 |

## 最小试讲设计

1. 从课纲选择一个能独立交付结果的最小单元，不默认拿整门课做第一次实验。
2. 为每个待验证问题建立 `pilot_hypothesis`：预期学员在什么场景完成什么动作；如果假设成立会看到什么；什么结果会推翻它。
3. 同时覆盖四类信号：
   - `comprehension`：学员能否用自己的话解释关键判断；
   - `execution`：学员能否完成指定动作或作业；
   - `transfer`：换一个相邻情境后能否继续使用方法；
   - `friction`：在哪一步停住、误解、跳过或需要外部帮助。
4. 只收集会影响课程决定的最小数据。能用一个作业结果验证时，不追加长问卷。
5. 写出样本范围与限制；少量内测只能验证明确问题，不能外推为普遍结论。

输出 `.course-producer/artifacts/pilot/pilot-plan.md`。

## 反馈归档

每条反馈写入 `.course-producer/artifacts/pilot/learner-feedback.jsonl`，至少包含：

```json
{"feedback_id":"fb-001","learner_id":"anonymous-01","lesson_id":"lesson-02","signal_type":"friction","evidence_type":"verbatim","locator":"interview:00:12:10","evidence":"...","interpretation":"...","confidence":"medium","related_hypothesis":"hyp-002","status":"open"}
```

- `evidence` 只保存真实原话、动作、作业结果或记录。
- `interpretation` 明确是制作方判断，不能倒写成学员事实。
- 问卷模板文字、主持人的引导句和 Agent 自评不算学员反馈。
- 个人身份不是课程判断所必需时使用匿名代号，不把敏感资料写入通用知识库。
- 赞美或“不喜欢”只能作为信号；要定位到具体教学动作后才能驱动修改。

## 修订决策

为每个要修改的问题建立一条 `.course-producer/artifacts/pilot/revision-decisions.jsonl`：

- 原始课程版本与具体位置；
- 已确认事实、学员原话和制作方解释；
- 计划修改的教学机制，而不只是换措辞；
- 观察指标与保留、撤回或继续测试的条件；
- 结果回填和对下一轮的影响。

同一模式在多个学员或不同证据类型中重复出现，才升级为结构性课程问题。单条强证据可以立即修复事实错误、安全风险或明显不可执行步骤；普通偏好不直接改全课。

修改课程时保留原稿或版本指纹，不覆盖已验证版本。优先做最小变更：补例子、降低抽象度、拆动作、增加练习或调整顺序；只有证据指向定位错误时才回到 `course-positioning`。

## 结果回填

下一轮数据回来后，把结果追加到原决策记录，不重写最初假设：

- `validated`：观察结果支持修改，并且没有破坏既有课程成果；
- `rejected`：结果未改善或出现更严重副作用，撤回或改写解释；
- `inconclusive`：样本或证据不足，保留为待验证；
- `superseded`：新的解释更好地覆盖现象，旧解释保留历史但不再驱动修改。

每轮结束生成 `.course-producer/artifacts/pilot/pilot-summary.md`，写清已验证结论、仍不确定项、版本决定和下一次最小试验。

## 完成检查

- 试讲计划包含可被推翻的假设、观察指标和最小反馈入口。
- 真实证据、学员原话与制作方解释分开记录。
- 课程修改能指向具体位置、具体机制和版本。
- 结果采用追加回填，没有把后见之明写进原始假设。
- 单次主观反馈没有被夸大成普遍学习规律。
- 没有真实数据时只交付试讲计划，不冒充效果验证。

若反馈主要是用户对文风的选择，路由到 `course-aesthetic-alignment`；若反馈证明课程承诺本身错误，回到 `course-positioning`；若只是事实、逻辑或口播问题，路由到 `course-quality-editor`。

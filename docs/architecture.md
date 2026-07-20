# Course Producer 架构契约

## 产品目标

Course Producer 是一组面向 Codex 长时 Goal 的课程生产 Skills。用户可以用中文“课程制作人”进入主路由，把本地文件、飞书文档、妙记转录、录音转写和已有课程稿交给 Codex，持续完成：

1. 材料盘点与证据登记；
2. 课程定位；
3. 行业专家知识萃取访谈；
4. 知识卡与成果优先课纲；
5. 分章逐字稿；
6. 逻辑、事实和 AI 写作坏味道审校；
7. 飞书协作交付；
8. 课程海报策略与可编辑原型。

首版优先保证单机文件工作流可恢复、产物可追溯。飞书和画板属于有权限时启用的交付适配器，不是核心生产链的硬依赖。

## 设计原则

- 主入口只路由，不承载全部方法论。
- 一个原子 Skill 只交付一个可验收结果。
- 方法论、模板、词典和知识原子进入 `知识库/`，由具体 Skill 按需读取。
- 每个事实、案例、数据和讲师原话保留来源标识；缺证据时标记待确认，不补造。
- 长任务每完成一个阶段就写检查点；恢复时从状态和产物继续，不重跑已确认阶段。
- 状态保存在用户课程项目内，不引入远程数据库、后台守护进程或自建 Agent 后端。
- Codex 当前模型是默认写作与推理模型。外部模型只能作为显式可用的可选适配器。

## 五层结构

```text
用户任务
   ↓
skills/course-producer                 主路由：识别模式、读取状态、选择下一阶段
   ↓
skills/course-*                        原子 Skills：每个只完成一个课程生产任务
   ↓
知识库/                                 方法论、模板、词典、原创知识原子
   ↓
tools/course_project.py                确定性状态机、材料指纹和完成度验证
   ↓
用户项目/.course-producer/              状态、证据索引、决策、产物和审校记录
```

## 原子 Skill 边界

| Skill | 唯一职责 | 主要输入 | 主要输出 |
|---|---|---|---|
| `course-producer` | 路由、恢复、阶段衔接和完成度审计 | 用户目标、项目状态 | 下一原子 Skill、阶段状态 |
| `course-material-intake` | 盘点并登记课程材料 | 文件夹、URL、现有转录 | `materials.jsonl`、缺口报告 |
| `course-positioning` | 确定课程定位 | 材料索引、用户约束 | `positioning.md`、待决策项 |
| `course-interview-design` | 设计动态专家访谈 | 定位、材料缺口 | `interview-guide.md`、记录结构 |
| `course-knowledge-extraction` | 从证据提取知识卡 | 转录、文件、来源索引 | `knowledge-cards.jsonl` |
| `course-outline-design` | 设计成果优先课纲 | 定位、知识卡 | `course-blueprint.md` |
| `course-lesson-writing` | 分章写正式逐字稿 | 课纲、知识卡、讲师原话 | `lessons/*.md` |
| `course-quality-editor` | 审校并形成修订闭环 | 课纲、章节稿、证据索引 | `review.jsonl`、修订稿 |
| `course-lark-delivery` | 写回飞书并建立评论协作 | 最终稿、审校项、目标 URL | 飞书文档、评论、回读证据 |
| `course-poster-planning` | 提炼海报策略与原型 | 完整课程、销售信息 | 海报方案、可编辑画板 |

原子 Skill 可以被用户直接调用。主路由不得复制它们的详细步骤，只保留触发信号、前置产物、完成条件和下一步规则。

## 长时 Goal 模式

主入口支持四种模式：

| 模式 | 触发信号 | 行为 |
|---|---|---|
| 全流程生产 | “把这些材料做成一门完整课程” | 初始化项目并按依赖推进全部必需阶段 |
| 从指定阶段开始 | “先做定位”“只写逐字稿” | 校验该阶段前置物，只执行指定阶段 |
| 恢复 | “继续上次的课程”“从断点继续” | 读取状态、验证既有产物，选择第一个未完成阶段 |
| 单项任务 | “检查这章 AI 味”“设计课程海报” | 直接调用对应原子 Skill，不强制建立完整项目 |

全流程默认阶段：

```text
intake
  → positioning
  → interview_design（已有充分访谈材料时可完成为 no_action）
  → knowledge_extraction
  → outline
  → lesson_writing（按章检查点）
  → quality_review（按章 + 全课）
  → lark_delivery（按用户目标或权限可选）
  → poster_planning（按用户目标可选）
  → completion_audit
```

只有以下情况暂停等待用户：

- 缺少会显著改变课程定位的业务选择；
- 需要新增账号、权限、密钥或外部协调；
- 即将覆盖真实文档、发布内容或作出高风险承诺；
- 证据互相冲突，无法用现有材料判定。

其他缺口写入 `decisions.jsonl` 或缺口报告，能继续的阶段继续推进。

## 项目状态协议

用户课程项目内使用以下单一状态源：

```text
.course-producer/
├── project.json
├── state.json
├── materials.jsonl
├── decisions.jsonl
└── artifacts/
    ├── positioning.md
    ├── interview-guide.md
    ├── knowledge-cards.jsonl
    ├── course-blueprint.md
    ├── lessons/
    └── review.jsonl
```

`state.json` 只保存控制信息和产物索引，不内嵌整篇课程正文。每个阶段至少记录：

- `status`: `pending`、`in_progress`、`completed`、`blocked`、`skipped`
- `input_fingerprints`
- `artifacts`
- `checks`
- `blockers`
- `updated_at`
- `next_action`

完成阶段必须同时满足：产物存在、输入指纹可追溯、该阶段验证通过。仅把状态字段改成 `completed` 不算完成。

## 知识库结构

```text
知识库/
├── README.md
├── 方法论/
│   ├── 课程定位.md
│   ├── 专家访谈.md
│   ├── 成果优先课纲.md
│   ├── 认知交付与逐字稿.md
│   ├── 课程审校.md
│   ├── 飞书课程协作.md
│   └── 课程海报.md
├── 模板/
│   ├── 课程项目模板.md
│   ├── 访谈记录模板.md
│   └── 单课框架模板.md
├── 原子库/
│   ├── README.md
│   └── atoms.jsonl
└── 课程制作词典.md
```

知识原子必须来自本项目明确列出的三个源 Skill 或用户后续提供且允许沉淀的材料。每条原子至少包含 `id`、`knowledge`、`type`、`topics`、`source` 和 `confidence`。

## 外部依赖兼容策略

| 依赖 | 首版策略 |
|---|---|
| Codex Goal | 通过可恢复项目状态和阶段协议适配；不声称能控制平台运行时长 |
| Aiberm / `claude-sonnet-5` | 从硬依赖降为可选模型适配器；无密钥或调用失败时使用当前 Codex 模型 |
| `dbs-deconstruct`、`dbs-logic-continuity`、`dbs-ai-check` | 将课程所需的判断标准原创地内化到知识库和审校 Skill；检测到已安装时可作为额外复核，不要求安装 |
| `lark-cli` 与飞书 Skills | 仅飞书材料读取和交付时需要；所有写入后必须回读验证 |
| `beautiful-feishu-whiteboard` | 仅海报画板原型阶段需要；不可用时仍交付完整文字方案 |
| 文档、PDF、音频工具 | 优先调用 Codex 已有 Skills 和平台工具；材料摄取层只登记证据，不自研格式解析框架 |

## Issue 实施顺序

Issue 按依赖顺序推进：

1. #1 架构与许可；
2. #2 仓库骨架与主入口；
3. #3 长任务状态机；
4. #4 材料摄取；
5. #5 课程定位；
6. #6 专家访谈；
7. #7 知识萃取与课纲；
8. #8 逐字稿；
9. #9 审校；
10. #10 飞书；
11. #11 海报；
12. #12 构建、测试与发布。

每个 Issue 独立提交、验证和关闭。当前 Issue 未完成时，不把下一 Issue 的实现混入同一提交。

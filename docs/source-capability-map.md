# 源能力迁移清单

## 范围

本项目合并并重构以下四个用户指定的源 Skill：

| 源 Skill | 本地来源 |
|---|---|
| `course-editor-in-chief-fanhan` | `/Users/fanhan/.agents/skills/course-editor-in-chief-fanhan/` |
| `lark-course-xiezuo` | `/Users/fanhan/.agents/skills/lark-course-xiezuo/` |
| `course-poster-design-plan` | `/Users/fanhan/.agents/skills/课程海报设计方案/` |
| `内容审美对齐@泛函` | `/Users/fanhan/.agents/skills/内容审美对齐@泛函/` |

“合并”指保留有效业务能力并重构边界，不等于把四个 `SKILL.md` 拼接到一个文件。

## dbskill 研究能力映射

`dbskill` 不是本项目的业务内容来源或运行时依赖。本轮只研究其公开 Skill 分别试图解决的通用问题，再为课程场景独立设计协议：

| 上游 Skill | 识别出的通用问题 | Course Producer 原创实现 |
|---|---|---|
| `dbs-goal` | 模糊目标不能驱动下一步，也没有完成判定 | `course-positioning` 的成果契约：产物、未完成信号、结束条件与上下文约束 |
| `dbs-good-question` | 问题缺少对象、冲突、约束和反馈入口 | `course-interview-design` 的问题契约与回答验证入口 |
| `dbs-knowledge` | 多版本资料缺少权威来源与导航规则 | `course-material-intake` 的材料分组、版本关系与权威状态 |
| `dbs-content-system` | 结构未稳定就全量抽取会放大返工 | `course-knowledge-extraction` 的跨来源样本验证和分批扩展 |
| `dbs-learning` | 后续内容应依据真实学习反馈调整难度与方式 | 新增 `course-pilot-iteration`，用理解、执行、迁移与摩擦信号驱动最小修订 |
| `dbs-decision` | 初始判断、后续结果和规律容易被后见之明混写 | 试讲修订决定采用追加式结果回填，保留课程版本与原始假设 |

没有迁移上游具体流程、字段文本、示例、脚本、知识原子或表达风格。

## 能力映射

| 源能力 | 新归属 | 处理方式 |
|---|---|---|
| 课程状态识别 | `course-producer` | 保留为路由信号 |
| 课程定位访谈 | `course-positioning` | 改成材料优先、必要时最少提问 |
| 认知交付五要素 | `知识库/方法论/认知交付与逐字稿.md` | 作为章节设计和审校共用真源 |
| 挑战情境公式 | `course-positioning` + 知识库 | 保留“场景 + 问题 + 约束” |
| 螺旋式课程结构 | `course-outline-design` | 保留章节递进和概念复用 |
| 成果优先课纲 | `course-outline-design` | 第一、第二模块各交付独立结果 |
| 动态专家访谈 | `course-interview-design` | 增加材料去重、证据请求和结束判定 |
| 单章框架与正文 | `course-lesson-writing` | 分章检查点，保留来源标识 |
| 已有文稿精修 | `course-quality-editor` | 先定教学任务，再修结构与表达 |
| 评论分类 | `course-quality-editor` + `course-lark-delivery` | 区分已吸收、待处理、过期、需判断 |
| 逻辑连续与信息密度 | `course-quality-editor` | 课程级和章节级两层检查 |
| 去 AI 味检查 | `course-quality-editor` | 以具体坏味道证据替代概率分 |
| 妙记 transcript 读取 | `course-material-intake` | transcript 为主，摘要只作导航 |
| 飞书原位更新与回读 | `course-lark-delivery` | 保留，写后必须回读 |
| 精确 block 评论 | `course-lark-delivery` | 只评论需要人判断的事项 |
| CEO 审查队列 | `course-lark-delivery` | 可定位则写入，失败不阻塞文档 |
| Aiberm 模型路由 | 可选适配 | 取消硬依赖，当前 Codex 模型可独立完成 |
| 海报购买逻辑 | `course-poster-planning` | 保留课程类型判断与信息顺序 |
| 海报文案和比例 | `course-poster-planning` + 知识库 | 保留可执行排版规格 |
| 飞书画板原型 | `course-poster-planning` | 调用既有白板 Skill，不复制其实现 |
| 用户改稿、满意与 A/B 选择学习 | `course-aesthetic-alignment` | 区分作品满意与长期规则，经过证据门后才演化 |

## 新增能力

三个源 Skill 没有完整覆盖、但长时 Goal 必须具备的能力：

- 课程项目状态机和断点续跑；
- 材料指纹与 `materials.jsonl`；
- 事实、观点、原话和待验证主张的证据链；
- 按章检查点和幂等重跑；
- 课程级完成度审计；
- 原子 Skill 的统一输入输出契约；
- 原创知识原子与方法论真源分层；
- 可构建、可验证的多 Skill 发布包。
- 项目级内容审美档案、正反例、改稿轨迹、偏好对与 Judge rubric。
- 可被推翻的试讲假设、真实学员证据、最小修订与追加式结果回填。

## 行为兼容与有意变更

### 保留

- 课程结果优先于知识目录；
- 已有稿件直接编辑，不强迫重新访谈；
- 保留讲师观点、案例和个人语言；
- 妙记必须读取转录；
- 飞书写入必须回读；
- 海报缺材料时使用占位，不编造事实。

### 有意变更

- 源流程中的多轮确认改为检查点：长时 Goal 在授权明确时连续推进，只有关键业务选择才暂停。
- “每次只问一个问题”只用于真实访谈，不再阻止材料充分时的自动生产。
- Aiberm 从强制模型路由改为可选适配，避免 Course Producer 离开特定密钥后失效。
- `dbs-*` 从硬依赖改为可选复核；课程专用判断标准在明确许可边界下原创进入本仓库。
- 主路由不会预设无条件长链，而是根据状态、材料和目标选择第一个有价值且前置满足的阶段。

## 不迁移内容

- 任何密钥、令牌、个人账号标识；
- 临时租户 token、飞书对象 token 或 CEO 队列表 ID；
- 源 Skill 中只适用于单一课程项目的讲师姓名或示例承诺；
- dbskill 的知识原子、方法论文档、代码或文案；
- 未验证的事实、数据、背书和价格。

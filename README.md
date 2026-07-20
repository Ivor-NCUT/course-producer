# Course Producer / 课程制作人

Course Producer 是一套面向 Codex Goal 长时运行的课程生产 Skills。中文调用名是“课程制作人”，机器入口是 `$course-producer`。它把本地文件、飞书文档、妙记转录和已有课程稿加工为可恢复、可追溯的课程定位、专家访谈、知识卡、成果优先课纲、逐章逐字稿、审校稿、飞书协作文档与海报方案。

## 能完成什么

- 盘点本地与飞书材料，建立 `materials.jsonl` 和缺口报告；
- 用现有证据完成课程定位，只询问会改变结果的关键选择；
- 根据材料缺口设计动态行业专家访谈；
- 从转录与文件中提取带来源位置的知识卡；
- 设计前两模块可独立交付成果的螺旋课纲；
- 按章节检查点写可讲、可录、可审的正式课程稿；
- 检查课程逻辑、事实证据、口播节奏和 AI 写作坏味道；
- 在授权可用时交付飞书文档、局部评论与可编辑海报画板；
- 从用户改稿、A/B 选择与满意信号中安全学习项目级审美偏好。
- 用真实试讲、作业和学员反馈验证教学假设，形成可回填的课程版本决定。

## 安装

要求 Node.js 20 或更高版本。完整课程生产不依赖远程数据库或自建 Agent 后端。

```bash
gh repo clone Ivor-NCUT/course-producer
cd course-producer
node tools/validate-skills.mjs
node tools/install.mjs
```

`install.mjs` 把 `skills/*` 链接到 `${CODEX_HOME:-~/.codex}/skills`，保留仓库内知识库的相对路径。若目标已存在，脚本默认停止；只有确认替换既有符号链接时才使用 `--force`。也可以从 Release 下载完整套件或某个独立 Skill ZIP。

飞书材料读取与交付需要已安装并授权的 `lark-cli` 及对应 Lark Skills；海报画板还需要 `beautiful-feishu-whiteboard`。这些能力不可用时，本地核心生产链仍可运行，飞书写入和画板会明确停在 blocker，不会伪装成功。

## 中文调用

```text
课程制作人，读取这个目录里的课程素材，建立项目状态并持续做成一门完整课程。

课程制作人，继续上次的课程项目，从第一个未完成阶段开始。

课程制作人，只检查这十章的逻辑、事实证据和 AI 写作坏味道，不改变讲师立场。

课程制作人，根据完整课程设计招生海报；缺失的价格和案例先留待补占位。
```

也可以直接调用原子 Skill，例如 `$course-positioning`、`$course-lesson-writing` 或 `$course-quality-editor`。

## Goal 运行方式

主路由只负责模式识别、恢复、阶段选择与完成度审计，具体工作由 11 个单一职责原子 Skill 完成：

```text
材料摄取 → 课程定位 → 访谈设计 → 知识萃取 → 成果优先课纲
        → 分章逐字稿 → 课程审校 → 飞书交付（可选）
        → 海报方案（可选） → 完成度审计
```

课程初稿需要真实验证时，可独立调用 `course-pilot-iteration` 建立“试讲假设 → 学员证据 → 最小修订 → 结果回填”循环。它是可选能力，不改变已有课程项目的核心阶段兼容性。

用户项目中的单一状态源：

```text
.course-producer/
├── project.json
├── state.json
├── materials.jsonl
├── decisions.jsonl
├── preferences/
└── artifacts/
    ├── positioning.md
    ├── interview-guide.md
    ├── knowledge-cards.jsonl
    ├── course-blueprint.md
    ├── lessons/
    └── review.jsonl
```

状态工具：

```bash
node tools/course-project.mjs --root /path/to/course init --name "课程名称"
node tools/course-project.mjs --root /path/to/course status
node tools/course-project.mjs --root /path/to/course resume
node tools/course-project.mjs --root /path/to/course verify --require-complete
```

阶段完成必须同时登记真实产物、输入指纹和验证结果。CLI 会拒绝非法迁移与已确认产物的静默替换；只有用户明确要求重验时才使用 `--force`。

## 目录结构

```text
skills/          主路由和单一职责原子 Skills
知识库/           方法论、模板、词典和原创 atoms.jsonl
tools/           状态、审校、校验、安装、样例与构建工具
tests/           状态机、审校与离线端到端测试
evals/           从零做课、材料做课、已有稿精修、断点续跑和海报等场景
examples/        可公开的离线协议样例
docs/            架构、来源和许可边界
```

详细设计见 [架构契约](docs/architecture.md)、[源能力迁移清单](docs/source-capability-map.md) 与 [许可和来源边界](docs/licensing-and-provenance.md)。

## 验证与构建

```bash
node tools/validate-skills.mjs
node tools/validate-evals.mjs
node --test tests/*.test.mjs
node tools/run-offline-sample.mjs --output dist/offline-sample
node tools/build.mjs
```

GitHub Actions 还会用 Python 3.12 运行 `tools/quick_validate.py skills/*`。构建脚本仅使用 Node.js 标准库，生成并逐 entry 解压校验：

- `dist/course-producer-suite.zip`：完整套件；
- `dist/skills/*.zip`：主路由与每个原子 Skill 的独立包；
- `dist/build-manifest.json`：文件数与校验结果。

离线样例验证完整核心阶段、检查点和必需产物清单；它不冒充模型内容质量评测，内容行为由 `evals/` 的场景与断言覆盖。

## 限制

- Course Producer 适配 Codex Goal 的长时运行与恢复协议，不控制平台实际运行时长，也不实现后台守护进程。
- 事实、数字、案例、背书和讲师原话必须有来源；缺证据时保留待确认，模型不会补造。
- 飞书写入、公开发布、覆盖真实文档和其他高风险动作仍受授权与确认门禁约束。
- 客户材料与项目级审美档案默认只留在用户项目，不进入通用知识库。
- 海报 Skill 交付策略和可编辑原型，不替代设计师制作最终商业成片。

## 来源与许可

本项目研究 [dontbesilent2025/dbskill](https://github.com/dontbesilent2025/dbskill) 的“主路由 + 原子 Skill + 文件型知识库”架构，以及目标验收、问题约束、知识版本治理和反馈回流等通用问题；所有课程规则均按课程场景原创重写，不复制其 CC BY-NC 4.0 内容、代码或知识原子。课程业务方法还来自用户指定的四个源 Skill，并在本仓库中按新的职责与证据协议重构。

Course Producer 自有代码与原创文档采用 [MIT License](LICENSE)。外部工具、用户材料与引用内容仍遵循各自许可和授权边界。

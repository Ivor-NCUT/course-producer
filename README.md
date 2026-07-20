# Course Producer / 课程制作人

Course Producer 是一组面向 Codex Goal 长时运行的课程生产 Skills。它把课程定位、行业专家知识萃取访谈、材料加工、成果优先课纲、分章逐字稿、逻辑与事实审校、去 AI 味、飞书协作和课程海报组织成可恢复的生产流程。

项目正在按 [GitHub Issues](https://github.com/Ivor-NCUT/course-producer/issues) 逐项实现。每条 Issue 独立验证、提交并关闭。

## 调用方式

安装后可以直接说：

```text
课程制作人，读取这个目录里的课程素材，建立项目状态并持续做成一门完整课程。

课程制作人，继续上次的课程项目，从第一个未完成阶段开始。

课程制作人，只检查这三章的逻辑、事实证据和 AI 写作坏味道。
```

机器入口：

```text
$course-producer
```

中文显示名与调用心智统一为“课程制作人”。

## 架构

```text
skills/course-producer        主路由
skills/course-*               单一职责的原子 Skills
知识库/                        方法论、模板、词典与原创知识原子
tools/                        确定性状态与构建工具
用户项目/.course-producer/     检查点、证据索引、决策与产物
```

主路由只决定当前该做什么；具体任务由一个原子 Skill 完成。长任务每完成一个阶段就写入检查点，恢复时跳过已验证产物。

详细设计：

- [架构契约](docs/architecture.md)
- [源能力迁移清单](docs/source-capability-map.md)
- [许可与来源边界](docs/licensing-and-provenance.md)

## 当前实现状态

- [x] 源能力、架构和许可边界
- [x] 中文主入口与多 Skill 仓库骨架
- [x] Goal 长任务状态机
- [x] 材料摄取
- [ ] 定位、访谈、知识萃取、课纲、逐字稿和审校
- [ ] 飞书协作与海报原型
- [ ] 完整构建、场景测试与发布包

尚未完成的原子 Skill 不会由主入口伪装成已经可用。

## 项目状态 CLI

```bash
node tools/course-project.mjs --root /path/to/course init --name "课程名称"
node tools/course-project.mjs --root /path/to/course status
node tools/course-project.mjs --root /path/to/course resume
node tools/course-project.mjs --root /path/to/course verify
```

阶段产物完成后用 `checkpoint` 登记真实文件、输入指纹和验证结果。CLI 默认拒绝非法状态迁移和已确认产物的静默替换；只有用户明确要求重验时才使用 `--force`。

## 来源边界

本项目研究了 [dontbesilent2025/dbskill](https://github.com/dontbesilent2025/dbskill) 的主路由、多 Skill 和文件型知识库结构。dbskill 使用 CC BY-NC 4.0；Course Producer 不复制其 Skill、知识原子、方法论文档、代码或文案。

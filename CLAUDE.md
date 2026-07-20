# Course Producer 项目说明

## 定位

本仓库是面向 Codex Goal 的多 Skill 课程生产系统。中文产品名与主入口显示名是“课程制作人”，机器标识是 `course-producer`。

## 顶层目录

| 路径 | 职责 |
|---|---|
| `skills/` | 主路由和单一职责原子 Skills |
| `知识库/` | 方法论、模板、词典和原创知识原子 |
| `tools/` | 项目状态、验证和构建脚本 |
| `tests/` | 确定性工具与端到端样例测试 |
| `evals/` | Agent Skill 场景评测 |
| `docs/` | 架构、来源、使用与发布文档 |

目录尚未在对应 Issue 中启用时不要放空壳占位文件。

## 依赖方向

```text
course-producer → 原子 Skills → 知识库
                         ↘ tools（确定性操作）
```

- 主路由不复制原子 Skill 的业务步骤。
- 原子 Skill 可以读取知识库和调用工具，不依赖主路由才能单独运行。
- 知识库不依赖 Skill。
- 用户课程项目状态不提交到本仓库。

## 变更协议

- 开始开发前认领当前 Issue。
- 一个提交只解决一个 Issue 或其紧密内聚的修复。
- 新增、移动、删除 Skill 或顶层目录时同步更新本文件和 `README.md`。
- 所有 Skill 必须通过 `quick_validate.py`。
- 外部写入必须回读；事实与课程素材必须保留来源。
- 不提交密钥、token、客户课程材料或 `.course-producer/` 运行状态。

## 状态工具

`tools/course-project.mjs` 是用户课程项目的唯一控制面，只读写项目根目录下的 `.course-producer/`。修改阶段名、状态迁移或指纹规则时，必须同步测试与 `docs/architecture.md`。

## 验证与发布

- `tools/validate-skills.mjs` 校验 Skill、界面元数据、路由、JSON 与知识原子。
- `tools/quick_validate.py` 在 GitHub Actions 的 Python 环境中执行 frontmatter 快速校验。
- `tools/build.mjs` 使用 Node.js 标准库构建并解压校验完整套件与独立 Skill ZIP。
- `tools/run-offline-sample.mjs` 验证核心阶段状态与产物协议，不代替 Agent 内容评测。

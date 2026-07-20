---
name: course-aesthetic-alignment
description: 课程内容审美对齐与可验证偏好学习。根据用户改稿、满意/否定信号、A/B 选择和跨样本稳定修改，记录 learning-log、正反例、edit traces、preference pairs 与 judge rubric；只把通过证据门的偏好更新为长期规则。Use when the user says 内容审美对齐、让课程制作人学习这次修改、沉淀改稿偏好、这版可以以后照着写、A/B 版本更喜欢哪个，或对课程逐字稿和审校结果给出反馈。
---

# 课程内容审美对齐

只管理反馈学习与安全演化，不代替逐字稿写作或课程审校。

## 先区分两个信号

- **作品满意**：当前版本已经可以使用。
- **规则可沉淀**：这次反馈体现跨任务稳定偏好，未来也应改变输出。

用户说“这版可以”时可以记录作品满意，但不得直接修改任何主 `SKILL.md`。若用户只要求改当前稿，完成当前修改即可；在写入偏好档案或迭代 Skill 前，确认用户是否要启动内容审美对齐流程。

## 项目偏好目录

默认把偏好保存在当前课程项目，不把客户或单项目审美写进通用仓库：

```text
.course-producer/preferences/
├── learning-log.md
├── customer-preference.md
├── examples/
│   ├── positive.md
│   ├── negative.md
│   └── edit-traces.md
└── eval/
    ├── test-prompts.json
    ├── preference-pairs.json
    └── judge-rubric.md
```

缺少目录时从 `assets/preference-profile/` 复制模板。原稿、反馈原话、用户改后稿或选择结果至少保留两者；只有含糊反馈时只写 learning log。

## 提取候选偏好

每条偏好必须可验证，并记录：

- `preference_id` 与具体生成指令；
- `status`: `candidate`、`validated`、`rejected`、`deprecated`；
- `confidence`: `low`、`medium`、`high`；
- 适用与不适用场景；
- 正向证据、反向证据和可能误判；
- 对生成与审校的实际影响；
- 最近验证日期。

“自然一点”“不要 AI 味”“更高级”不能直接成为偏好。把它落到可观察差异，例如“连续解释一个动作时保留 2–5 个短句的自然句群，避免一行一句”。证据不足则保持 candidate。

## 验证门

偏好进入 `validated` 必须同时满足：

1. 至少两条来自不同内容样本的正向证据；或一条带完整原稿→用户改稿的强证据，加一条用户明确原话/选择；
2. 能解释至少一个历史满意样本，并避开至少一个反例；
3. 不与既有 validated 偏好冲突；有冲突时写清场景边界；
4. 能转成明确生成指令或 Judge 判断项；
5. 不是一次性选题、平台活动、事实修正或临时情绪；
6. 回测没有明显破坏课程任务完成度、事实保真与其他内容类型。

同一次生成过程的自评分不能算用户证据，也不能由它自己宣布进化成功。没有独立用户选择或历史反馈时，只能形成候选。

## 三类评测

- 单次满意：只验证当前作品可用，默认写 learning log 与正例，不单独验证长期规则。
- A/B 选择：记录相同任务下用户选中的版本、被拒版本与具体理由，形成 preference pair。
- 跨样本稳定修改：在至少两个不同主题/章节上应用候选偏好，用 judge rubric 检查审美一致性、反例避让、任务完成度和事实边界。

## 更新顺序

按证据强度依次选择写入位置：learning log → customer preference candidate → examples / preference pairs → judge rubric → 主 Skill。只有 validated 且确实需要改变通用生成行为时，才提出 Skill 更新；用户明确要求沉淀到 Skill 后，调用仓库既有的 Skill 迭代工作流并保留 git diff 与回滚点。

每次学习输出本轮满意信号、候选偏好、证据、置信度、更新文件、回测结果和下次需要验证的样本。

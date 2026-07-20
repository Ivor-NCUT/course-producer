# 原创知识原子

`atoms.jsonl` 保存 Course Producer 从四个用户指定源 Skill 中重写、抽象并经过边界检查的原创知识单元，不复制 dbskill 内容。

字段：

- `id`：稳定标识；
- `knowledge`：可独立使用的判断或规则；
- `type`：principle、workflow、quality_gate、boundary；
- `topics`：用于按阶段检索；
- `source`：来源能力名称或本项目设计结论；
- `confidence`：high、medium、low。

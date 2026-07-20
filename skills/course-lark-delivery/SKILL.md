---
name: course-lark-delivery
description: 把最终课程定位、课纲、章节稿和审校意见写入可协作的飞书文档，支持原位更新、保留原稿创建同级文档、目标文件夹批量建文档、精确 block 评论和可选 CEO 审查队列，并执行写后回读。Use when the user says 交付飞书文档、回写课程稿、在飞书上协作、给课程稿加评论、创建课程文档，或 Course Producer 进入 lark_delivery 阶段。
---

# 飞书课程协作交付

只负责飞书对象解析、写入、评论和回读，不改写课程内容。执行任何命令前遵循 `lark-shared`；文档、Wiki、Drive、妙记分别调用对应 Lark Skill，不自建 API 客户端。

## 解析输入

1. 用 `lark-cli auth status --json --verify` 检查当前用户身份；需要访问用户资源时显式使用 `--as user`。
2. 对任意 URL 先运行 `lark-cli drive +inspect --url '<url>' --as user --format json`。Wiki URL 必须保存 `wiki_node.space_id`、`node_token`、底层 `obj_token` 与 `obj_type`，不能把 Wiki token 当文档 token 猜用。
3. 妙记 URL 从路径取 `minute_token`，用 `minutes +detail --minute-tokens <token> --transcript` 读取转录；摘要只作导航。
4. 写入前读取目标现状与标题，记录原对象、父节点/文件夹和计划操作。若用户未授权覆盖已有正文，停在写入前并说明影响。

## 三种交付模式

### 原位更新

适用于用户明确要求直接编辑当前稿。用 `docs +update` 写入最终正文；局部精修使用 XML block 命令，整篇明确覆盖时才用 `overwrite`。覆盖前保留原文指纹或版本信息。

### 保留原稿创建同级文档

解析原文档所属 Wiki/Drive 父级，在同一父节点创建新 Docx。标题明确标出“正式稿”或版本，正文不要重复文档标题。

### 目标文件夹批量建文档

先 `drive +inspect` 取得真实 folder token，再为课纲和每章分别执行 `docs +create --parent-token <folder-token> ... --as user`。本地 `@file` 必须使用当前工作目录下的相对路径。

## 写后双重验证

每次创建或更新后都必须：

1. `docs +fetch --doc '<url-or-token>' --doc-format markdown --as user --format json` 回读正文，核对标题、开头、章节数量和关键文本；
2. 对文件夹交付执行 `drive files list --params '{"folder_token":"<token>","page_size":200}' --as user --format json`，手动翻页并核对新文档的名称与 token。

命令返回成功但正文为空、内容不一致或文件夹中找不到对象，均视为未交付。

## 评论协作

只把 `review.jsonl` 中 `needs_decision` 的事项提交给人判断。`auto_fix` 已完成项和普通 `needs_evidence` 留在审校记录，不用把飞书文档变成问题墙。

1. 用 `docs +fetch --doc '<target>' --doc-format xml --detail with-ids --as user` 获取真实 block id。
2. 用问题中的 `locator` 和精确文本定位 block；定位不到时重新读取，不猜 id。
3. 调用 `drive +add-comment --doc '<target>' --block-id '<id>' --content '[...]' --as user` 添加局部评论。
4. 目标 block 不支持评论时，锚定最近的文本子 block；仍不可定位时保留到交付报告，不降级成误导性的随机评论。

## CEO 审查队列

只有当前环境能从已有配置或用户提供位置准确找到审查队列时才更新。记录最终文档链接、审查状态、AI 自检结果和需要判断的具体事项。无法定位、缺 scope 或队列结构变化时，记录 blocker，但不阻塞已验证的文档交付。不得硬编码 app/table/token。

## 安全与完成检查

- 不输出或持久化 app secret、access token、device code 等凭据。
- 不在群聊发起用户 OAuth；权限不足按 bridge 与 `lark-shared` 规则处理。
- 原位覆盖、外部发布和高风险写入遵守确认门禁。
- 所有目标 URL 已解析到真实对象，正文回读通过，文件夹归属验证通过。
- 评论均锚定精确文本 block，数量与待判断事项一致。
- 审查队列更新成功或明确记录为非阻塞未完成。

把文档 URL、token、回读摘要、归属验证和评论结果写入阶段产物，再登记检查点。

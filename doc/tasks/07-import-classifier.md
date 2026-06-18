# Task: 智能导入模块 — 分类器 + BlockFactory

## Objective

实现 ContentClassifier（规则流水线分类引擎）和 BlockFactory（分类结果转 Block 对象）。

## Input Docs

- doc/high-level-design.md (智能导入模块)
- doc/detailed-design.md (ContentClassifier + BlockFactory 详细设计)

## Expected Files

- `src/components/Import/classifier/ContentClassifier.ts`
- `src/components/Import/classifier/ruleRegistry.ts`
- `src/components/Import/classifier/rules/nameRule.ts`
- `src/components/Import/classifier/rules/contactRule.ts`
- `src/components/Import/classifier/rules/timelineRule.ts`
- `src/components/Import/classifier/rules/skillRule.ts`
- `src/components/Import/classifier/rules/headingRule.ts`
- `src/components/Import/classifier/rules/paragraphRule.ts`
- `src/components/Import/BlockFactory.ts`

## Dependencies

- 06-import-parsers

## Implementation Steps

- [ ] 定义 ClassifierRule 基类/接口
- [ ] 实现 contactRule：正则匹配手机号/邮箱/GitHub/LinkedIn/URL，K/V 对识别
- [ ] 实现 timelineRule：日期范围识别 → 提取标题行 → 提取描述段 → 合并相邻项
- [ ] 实现 nameRule：前 3 段 + 2-4汉字 + 大字号优先
- [ ] 实现 headingRule：短文本 + 加粗/关键词（教育/工作/技能/项目/联系等）
- [ ] 实现 skillRule：短文本行 + 逗号/顿号拆分 → 标签组；含百分比 → 技能条
- [ ] 实现 paragraphRule：兜底规则，未匹配段落合并为 body
- [ ] 实现 ContentClassifier：按优先级执行规则流水线，冲突解决（高置信度优先），结果排序
- [ ] 实现 BlockFactory：ClassificationResult[] → Block[]（通过 nanoid 生成 id，应用默认样式）

## Tests And Checks

- 单元测试：每类规则的 mock 输入 → 验证分类结果
- ContentClassifier 集成测试：喂入多段文本 → 验证输出类型和数量

## Definition Of Done

- [ ] 6 条规则全部实现
- [ ] 冲突解决正确（同一段不重复匹配）
- [ ] BlockFactory 生成正确类型和结构的 Block 对象
- [ ] 中文简历文本测试通过

# GitHub Discussions Show and tell 帖子草稿

## 标题

dsh-cache-guard：缓存健康度守卫与省钱教练（事前干预，不是事后计费面板）

## 正文

### 一句话介绍

一个 DSH 插件，在会话过程中监听缓存失效信号，通过 `cache_guard_health` 工具给出绿/黄/红健康度 + 一行≤20字干预建议，引导你调整会话行为降低成本。不做事后计费，不做右侧面板，不做图表。

### 核心能力

- **缓存健康度**：`green` / `yellow` / `red` / `none` 四态，附触发原因与窗口摘要（messageCount / toolsetHash / systemPromptHash）
- **一行干预建议**：≤20 字简体中文，PTC 优先，随健康度工具一起返回
- **PTC 模式切换提示**：长工具链场景（standard 档连续 5 次工具调用），5min 节流后置位 `ptcHintActive`
- **配置读写**：`cache_guard_config` 工具读写 enabled / sensitivity（loose/standard/aggressive）/ showPtcHint，对当前插件实例生效

### 信号判定逻辑

| 信号 | 触发条件 | 文案示例 |
|---|---|---|
| 🟢 绿 | 连续 N 帧单调增长 ∧ 工具集不变 ∧ 系统提示不变 | — |
| 🟡 黄 | 工具集变更 / 系统提示重写 / 消息超阈值 | "工具集变更，建议收敛或开 PTC" |
| 🔴 红 | 连续≥3次工具调用后上下文膨胀>5000 token | "建议检查会话上下文" |

### 工程质量

```
Test Files  17 passed (17)
     Tests  68 passed (68)
```

覆盖单元测试、集成测试、DFX 验证（≤5ms P99 性能 / ≤512KB 窗口容量 / 零网络 / 无敏感泄露 / 高频不丢变更），并在真实 `cordis` + `dsh-tools` 宿主中完成装载、工具注册与 `execute`/`render` 调用验证。

### 安装

```bash
dsh plugin add github:liuhange789/dsh-cache-guard
dsh web
```

### 技术栈

- DSH Host-only 插件（`inject: ['tools']`），不发布 client 半边
- TypeScript + vitest
- FNV-1a 哈希做工具集/系统提示变更检测

### 不做的事

- 不做精确计费、账单回溯、历史成本曲线
- 不做右侧面板、抽屉、浮层
- 不做全量图表可视化
- 不做多模型对比

---

# dshbase 目录提交文案

## 文件名

dsh-cache-guard.md

## 内容

```markdown
# dsh-cache-guard

缓存健康度守卫与省钱教练 — 事前干预，不是事后计费面板。

## 功能

- 缓存健康度（绿/黄/红/none，含触发原因与窗口摘要）
- 一行干预建议（≤20字，PTC 优先）
- PTC 模式切换提示（长工具链，5min节流）
- 配置读写（enabled / sensitivity / showPtcHint）

## 安装

    dsh plugin add github:liuhange789/dsh-cache-guard

## 测试

    Test Files  17 passed (17)
         Tests  68 passed (68)

## 仓库

https://github.com/liuhange789/dsh-cache-guard
```

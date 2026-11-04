# GitHub Discussions Show and tell 帖子草稿

## 标题

dsh-cache-guard：缓存健康度守卫与省钱教练（事前干预，不是事后计费面板）

## 正文

### 一句话介绍

一个 DSH 插件，在会话过程中监听缓存失效信号，通过状态栏小圆点（绿/黄/红）+ 一行≤20字干预建议，引导你调整会话行为降低成本。不做事后计费，不做右侧面板，不做图表。

### 核心能力

- **缓存健康度状态灯**：8px 三色圆点（绿=#52C41A / 黄=#FAAD14 / 红=#FF4D4F），纯原生 DOM，无 UI 框架
- **黄灯一行干预建议**：≤20 字简体中文，30s 节流，不骚扰
- **PTC 模式切换提示**：长工具链场景（standard 档连续 5 次工具调用），5min 节流
- **设置面板**：enabled / sensitivity（loose/standard/aggressive）/ showPtcHint

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

覆盖单元测试、集成测试、DFX 验证（≤5ms P99 性能 / ≤512KB 窗口容量 / 零网络 / 无敏感泄露 / 高频不丢变更）。

### 安装

```bash
node scripts/auto-register.js
dsh web
```

### 技术栈

- DSH both 模式（Host + Client 双包）
- TypeScript + vitest
- 纯原生 DOM UI（无 React/Vue/任何 UI 框架）
- FNV-1a 哈希做工具集/系统提示变更检测

### 不做的事

- 不做精确计费、账单回溯、历史成本曲线
- 不做右侧面板、抽屉、浮层
- 不做全量图表可视化
- 不做多模型对比

---

> 真机截图待补（dsh CLI 安装后更新）。代码层已通过 68 个单测 + 4 个事件流模拟场景全量验证。

---

# dshbase 目录提交文案

## 文件名

dsh-cache-guard.md

## 内容

```markdown
# dsh-cache-guard

缓存健康度守卫与省钱教练 — 事前干预，不是事后计费面板。

## 功能

- 缓存健康度状态灯（绿/黄/红）
- 黄灯一行干预建议（≤20字，30s节流）
- PTC 模式切换提示（长工具链，5min节流）
- 设置面板（enabled / sensitivity / showPtcHint）

## 安装

    node scripts/auto-register.js

## 测试

    Test Files  17 passed (17)
         Tests  68 passed (68)

## 仓库

[待补充 GitHub 仓库链接]
```
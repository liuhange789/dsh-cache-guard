# dsh-prompt-cache-guard

DSH 提示缓存健康度守卫与省钱教练 — 事前干预，不是事后计费面板。

## 简介

`dsh-prompt-cache-guard` 是一个 [DSH](https://github.com/deepseek-ai/dsh) (DeepSeek Harness) 插件，在会话过程中监听缓存失效信号，给出绿/黄/红健康度、一行干预建议与 PTC 提示，引导用户调整会话行为，降低 KV Cache 失效导致的成本浪费。

> **与 npm 上同名包无关**：npm 上的 `dsh-cache-guard@0.4.0` 由 `loonylabs-dev` 维护，是另一套实现（对每次上下文重写先定价、默认询问用户、报告冷读），**不是本仓库**。本插件在 npm 上的包名是 `dsh-prompt-cache-guard`，仓库仍是 `liuhange789/dsh-cache-guard`。安装时请认准 `dsh-prompt-cache-guard`。

### 核心能力

| 能力 | 说明 |
|---|---|
| 缓存健康度 | `cache_guard_health` 工具返回 `green` / `yellow` / `red` / `none` 与触发原因 |
| 一行干预建议 | ≤20 字简体中文，PTC 优先（随健康度工具一起返回） |
| PTC 模式切换提示 | 长工具链场景，5min 节流后置位 `ptcHintActive` |
| 配置读写 | `cache_guard_config` 工具读写 enabled / sensitivity / showPtcHint（对当前插件实例生效） |

### 不做的事

- 不做精确计费、账单回溯、历史成本曲线
- 不做右侧面板、抽屉、浮层
- 不做全量图表可视化
- 不做多模型对比

## 架构

Host-only 插件（`inject: ['tools']`），信号通过两个工具对外提供：

```
dsh-prompt-cache-guard/
├── host/          # Host 侧：事件监听 + 信号引擎 + 工具注册
│   └── src/
│       ├── listeners/    # 三事件监听器
│       ├── engine/       # 启发式判定引擎 + 节流器
│       ├── model/        # 数据模型 + 滑动窗口
│       ├── config/       # 配置 schema + 装载期配置归一化
│       └── tools.ts      # cache_guard_health / cache_guard_config
├── client/        # 历史浏览器侧源码（未随包发布，见下）
└── vitest.config.ts
```

> `client/` 里的状态灯 / 设置面板建立在 `ctx.ui.*`、`ctx.expose`、`ctx.push` 之上，这些 API 在 DSH 的 Host Context 上并不存在，浏览器侧也没有 host→client 的数据通道。本轮把它们下线，`dsh.client`、`exports["./client"]`、`files` 里都不再包含 client；同样的能力改由上面两个工具承载。要恢复状态灯，需要先接入真实的 client 插件 API 与数据通道。

### 关键约束

- Host `inject: ['tools']`
- 事件处理 ≤5ms，快照窗口 ≤512KB
- 无网络请求，无敏感数据外泄

## 安装

```bash
# 从 npm 安装（包名 dsh-prompt-cache-guard）
dsh plugin add dsh-prompt-cache-guard

# 或从仓库安装（读取根 package.json 的 main → host/dist/index.js，并按 cordis.patch.yml 注入）
dsh plugin add github:liuhange789/dsh-cache-guard

# 重启 DSH
dsh web
```

### 手动安装

```bash
# 构建产物
npm run build

# 将整个包目录复制到 DSH 插件目录
cp -r . ~/.dsh/plugins/dsh-prompt-cache-guard
```

## 配置

装载时通过 cordis patch 的 `config` 传入；运行期可用 `cache_guard_config` 工具改写（仅对当前实例生效，不落盘）。

| 配置项 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `enabled` | boolean | `true` | 启用/禁用插件 |
| `sensitivity` | `loose` \| `standard` \| `aggressive` | `standard` | 灵敏度档位 |
| `showPtcHint` | boolean | `true` | 是否展示 PTC 提示 |

### 灵敏度档位阈值

| 参数 | loose | standard | aggressive |
|---|---|---|---|
| messageThreshold | 40 | 25 | 15 |
| rewriteWindowMs | 20000 | 10000 | 5000 |
| bloatThreshold | 8000 | 5000 | 3000 |
| consecutiveToolCallsForPtc | 8 | 5 | 3 |

## Testing

```
Test Files  17 passed (17)
     Tests  68 passed (68)
  Duration  ~1.2s
```

验证覆盖：

- **单元测试**：信号引擎判定（绿/黄/红优先级）、灵敏度档位单调性、节流器边界、滑动窗口容量、配置归一化、文案长度、超时判定
- **集成测试**：生命周期（装载→事件→卸载）、三事件混合优先级、配置热更（装载期配置 + 工具改写）、超时降级
- **DFX 验证**：≤5ms P99 性能、≤512KB 窗口容量、零网络调用、无敏感数据泄露、高频不丢变更
- **真实宿主**：`cordis` + `dsh-tools` 装载后能注册两个工具，`execute` / `render` / `output.schema` 形状通过校验

```bash
# 运行测试
npx vitest run --config vitest.config.ts --isolate=false
```

## 开发

```bash
# 安装依赖
npm install

# 类型检查
npx tsc --noEmit -p host/tsconfig.json

# 构建（host/tsconfig.json 继承根配置的 rewriteRelativeImportExtensions，dist 里不会残留 .ts 导入）
npx tsc -p host/tsconfig.json

# 测试
npx vitest run --config vitest.config.ts --isolate=false
```

## License

MIT

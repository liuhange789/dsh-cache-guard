# dsh-cache-guard

DSH 缓存健康度守卫与省钱教练 — 事前干预，不是事后计费面板。

## 简介

`dsh-cache-guard` 是一个 [DSH](https://github.com/deepseek-ai/dsh) (DeepSeek Harness) 插件，在会话过程中监听缓存失效信号，通过状态灯（绿/黄/红）和一行干预建议引导用户调整会话行为，降低 KV Cache 失效导致的成本浪费。

### 核心能力

| 能力 | 说明 |
|---|---|
| 缓存健康度状态灯 | 绿/黄/红三色圆点，8px 原生 DOM 渲染 |
| 黄灯一行干预建议 | ≤20 字简体中文，30s 节流，PTC 优先 |
| PTC 模式切换提示 | 长工具链场景，5min 节流 |
| 设置面板 | enabled / sensitivity / showPtcHint 三配置项 |

### 不做的事

- 不做精确计费、账单回溯、历史成本曲线
- 不做右侧面板、抽屉、浮层
- 不做全量图表可视化
- 不做多模型对比

## 架构

DSH both 模式（Host + Client 双包）：

```
dsh-cache-guard/
├── host/          # Host 侧：事件监听 + 信号引擎 + 轻量 API
│   └── src/
│       ├── listeners/    # 三事件监听器
│       ├── engine/       # 启发式判定引擎 + 节流器
│       ├── model/        # 数据模型 + 滑动窗口
│       └── config/       # 配置 schema + 容错读取
├── client/        # Client 侧：UI 渲染 + 通信封装
│   └── src/
│       ├── ui/           # statusDot + hintLine + settingsPanel
│       └── hostClient.ts # host.call() RPC 封装
└── vitest.config.ts
```

### 关键约束

- Host `inject: ['agents', 'tools']`
- Client 禁止 import `@deepseek-ai/*`
- 事件处理 ≤5ms，快照窗口 ≤512KB
- 无网络请求，无敏感数据外泄

## 安装

```bash
# 自动注册到 DSH 插件目录
node scripts/auto-register.js

# 重启 DSH
dsh web
```

### 手动安装

```bash
# 构建产物
npm run build

# 将 host/dist 和 client/dist 复制到 DSH 插件目录
cp -r . ~/.dsh/plugins/dsh-cache-guard
```

## 配置

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
  Duration  ~3s
```

验证覆盖：

- **单元测试**：信号引擎判定（绿/黄/红优先级）、灵敏度档位单调性、节流器边界、滑动窗口容量、配置容错、文案长度、超时判定
- **集成测试**：生命周期（装载→事件→卸载）、三事件混合优先级、配置热重载、RPC 往返、超时降级
- **DFX 验证**：≤5ms P99 性能、≤512KB 窗口容量、零网络调用、无敏感数据泄露、高频不丢变更

```bash
# 运行测试
npx vitest run --config vitest.config.ts --isolate=false
```

## 开发

```bash
# 安装依赖
npm install --cache "C:/Users/HP/AppData/Local/Temp/npm-cache-tmp"

# 类型检查
npx tsc --noEmit -p host/tsconfig.json
npx tsc --noEmit -p client/tsconfig.json

# 构建
npx tsc -p host/tsconfig.build.json
npx tsc -p client/tsconfig.build.json

# 测试
npx vitest run --config vitest.config.ts --isolate=false
```

## License

MIT
# dsh-cache-guard 黄灯行为论证报告

**论证时间**：2026-11-04 22:30
**论证对象**：C:\Users\HP\.agent-browser\dsh-cache-guard
**论证方式**：单元测试全量回归 + 事件流模拟（直接驱动 host/dist 编译产物）

## 一、真机装载状态

| 步骤 | 命令 | 结果 |
|---|---|---|
| 自动注册 | `node scripts/auto-register.js` | ✅ 已复制到 `C:\Users\HP\.dsh\plugins\dsh-cache-guard`（Windows 走 cpSync，非 symlink） |
| 重启 DSH | `dsh web` | ❌ 阻塞：本机未安装 dsh CLI（`Get-Command dsh` 无返回） |
| 设置面板确认 | — | ❌ 无法进入真机 UI |

**结论**：插件文件已就位，但 DSH 宿主程序不存在，无法完成"真机截图 + GitHub Discussions 发布"。本报告改用代码层证据完成黄灯行为论证。

## 二、单元测试回归

```
Test Files  17 passed (17)
     Tests  68 passed (68)
  Duration  1.96s
```

覆盖：信号引擎优先级、灵敏度档位单调性、节流器边界、滑动窗口容量、配置容错、文案长度、DFX（≤5ms / ≤512KB / 零网络）。

## 三、事件流模拟实证（standard 灵敏度）

模拟脚本：`simulate-yellow.mjs`，手动时钟驱动，直接调用 `healthSignalEngine.compute` + `SignalThrottler`。

### 场景 1：工具集变更 → 黄灯

| 时间 | 事件 | 结果 |
|---|---|---|
| t=0~8s | 连发 5 条纯文本 | level=none/green，无提示 |
| t=10s | 突然切工具集 A→B | **level=yellow, reason=toolset_change**, hint="工具集变更，建议收敛或开 PTC" |

黄灯第一次切换就亮，无 messageCount 门槛。

### 场景 2：30s 节流防吵

| 时间 | 事件 | emitted |
|---|---|---|
| t=10s | 切工具集第 1 次 | **YES（亮）** |
| t=15s | 切工具集第 2 次 | no（被节流） |
| t=20s | 切工具集第 3 次 | no |
| t=25s | 切工具集第 4 次 | no |
| t=30s | 切工具集第 5 次 | no |
| t=66s | 冷却 31s 后再切 | **YES（重新亮）** |

同一 triggerReason 30 秒内只 emit 一次，5 次连续切换只响 1 次。

### 场景 3：长工具链 PTC

| 工具调用次数 | 结果 |
|---|---|
| tools=1~4 | level=none/green，无 PTC |
| tools=5 | **ptc=ON**, hint="长工具链建议开启 PTC 缓存" |
| tools=6 | ptc=-（PTC 5min 节流，不重复弹） |

standard 档连续 5 次工具调用即触发 PTC 提示，且 PTC 提示 5 分钟只弹一次。

### 场景 4：message_over_threshold

| 消息数 | 结果 |
|---|---|
| msg=25 | green |
| msg=26 | **level=yellow, reason=message_over_threshold**, hint="消息过多未命中，建议开新会话" |
| msg=27~44 | 全部 emitted=no（30s 节流） |

## 四、核心问题论证结论

### Q1：黄灯会不会太吵？

**不会。** 三重节流叠加：

| 节流层 | 参数 | 来源 |
|---|---|---|
| 黄灯按原因独立节流 | 30s / triggerReason | `signalThrottler.ts:4` `YELLOW_THROTTLE_MS=30_000` |
| PTC 提示节流 | 5min | `signalThrottler.ts:5` `PTC_THROTTLE_MS=300_000` |
| UI 重绘防抖 | 1s | `signalThrottler.ts:6` `UI_THROTTLE_MS=1_000` |

且红灯/绿灯/none 不节流（状态切换必须即时反馈），只有黄灯按原因节流——这是"提醒但不骚扰"的设计。

### Q2：黄灯会不会没亮过？

**不会。** 三个独立触发路径，门槛都很低：

1. **toolsetChanged**：无 messageCount 门槛，第一次工具集 hash 变化就亮（场景 1 实证 t=10s 即亮）
2. **systemPromptRewrite**：系统提示重写即亮
3. **message_over_threshold**：standard 档 25 条消息 + 连续窗口内每次 delta 都在 (0, 5000) 之间

### Q3：UI 侵入性？

从 `client/src/ui/statusDot.ts` 和 `hintLine.ts` 静态代码确认：

- **状态灯**：8px 圆点，`marginLeft:8px`，`flexShrink:0`，none 时 `display:none`，无动画、无闪烁、无 transition
- **提示行**：12px 字号，`#FAAD14` 文字色，`background:transparent`，`whiteSpace:nowrap` + ellipsis 截断，`marginBottom:4px`
- 不做右侧面板/抽屉/浮层（README 明确"不做的事"）
- 文案全部 ≤20 字（实测 9~15 字），一行放下

**结论**：黄灯/红灯不会顶歪聊天界面，不会疯狂闪烁。

## 五、待真机验证项（dsh CLI 安装后补做）

1. `dsh web` 启动后，设置面板里 dsh-cache-guard 是否出现在插件列表且默认 enabled
2. 8px 圆点在 DSH 原生状态栏里的实际视觉对齐
3. 黄灯时 hintLine 是否真的落在输入框上方一行
4. 截图存 `dshbase/` 目录，贴入 README Testing 章节
5. 发 GitHub Discussions Show and tell

## 六、产物清单

- 模拟脚本：`C:\Users\HP\.agent-browser\dsh-cache-guard\simulate-yellow.mjs`
- 插件注册位置：`C:\Users\HP\.dsh\plugins\dsh-cache-guard\`
- 测试结果：17 files / 68 tests 全绿
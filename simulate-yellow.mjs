// 黄灯行为实证脚本：模拟三个真机测试场景，输出每一步信号与节流决策
import { compute } from './host/dist/engine/healthSignalEngine.js';
import { SignalThrottler } from './host/dist/engine/signalThrottler.js';
import { resolveProfile } from './host/dist/model/sensitivityProfile.js';
import { createSessionSnapshot } from './host/dist/model/sessionSnapshot.js';
import { SnapshotWindow } from './host/dist/model/snapshotWindow.js';
import { getYellowHint, getPtcHint } from './client/dist/hintTemplates.js';

const profile = resolveProfile('standard');
const throttler = new SignalThrottler();
const window = new SnapshotWindow();

let now = 1_000_000; // 模拟时钟起点
let currentSignal = { level: 'none', triggerReason: null, ptcHintActive: false };
let toolsetHash = 'hash-A';
let messageCount = 0;
let consecutiveToolCalls = 0;
let toolsetChangedFlag = false;
let systemPromptRewriteFlag = false;

function pushSnapshotAndRecompute({ delta = 100, label }) {
  messageCount += 1;
  const snap = createSessionSnapshot({
    messageCount,
    toolsetHash,
    systemPromptHash: 'sys-v1',
    contextTokenDelta: delta,
    consecutiveToolCalls,
    lastSignalAt: now,
    capturedAt: now,
  });
  window.push(snap);
  const signal = compute({
    snapshots: window.all(),
    profile,
    prevSignal: currentSignal,
    toolsetChanged: toolsetChangedFlag,
    systemPromptRewrite: systemPromptRewriteFlag,
    now,
  });
  // PTC 状态注入（模拟 toolPreExecListener 的连续工具计数）
  if (consecutiveToolCalls >= profile.consecutiveToolCallsForPtc) {
    if (throttler.shouldEmitPtc(now)) signal.ptcHintActive = true;
  }
  const emitted = throttler.shouldEmit(signal, now);
  if (emitted) {
    currentSignal = signal;
    toolsetChangedFlag = false;
    systemPromptRewriteFlag = false;
  }
  const hint = signal.ptcHintActive
    ? getPtcHint()
    : signal.level === 'yellow' && signal.triggerReason
      ? getYellowHint(signal.triggerReason)
      : '';
  console.log(
    `t=${String((now - 1_000_000) / 1000).padStart(6)}s | msg=${String(messageCount).padStart(2)} | tools=${String(consecutiveToolCalls).padStart(2)} | level=${signal.level.padEnd(7)} | reason=${(signal.triggerReason || '-').padEnd(22)} | emitted=${emitted ? 'YES' : 'no '} | ptc=${signal.ptcHintActive ? 'ON' : '- '} | hint="${hint}"`
  );
  return signal;
}

console.log('=== 场景 1：工具集变更触发黄灯（先发纯文本，再突然切工具集）===');
for (let i = 0; i < 5; i++) {
  pushSnapshotAndRecompute({ delta: 50, label: '纯文本消息' });
  now += 2000;
}
console.log('--- 突然切换工具集 A→B ---');
toolsetHash = 'hash-B';
toolsetChangedFlag = true;
pushSnapshotAndRecompute({ delta: 50, label: '切工具集' });

console.log('\n=== 场景 2：30s 节流防吵——同原因 5 秒内连续切工具集 5 次 ===');
for (let i = 0; i < 5; i++) {
  toolsetHash = `hash-CHANGE-${i}`;
  toolsetChangedFlag = true;
  pushSnapshotAndRecompute({ delta: 50, label: '连续切工具集' });
  now += 5000; // 每 5s 一次，30s 节流内
}
console.log('--- 等待 30s+ 后再次切换（应重新亮黄）---');
now += 31_000;
toolsetHash = 'hash-AFTER-WAIT';
toolsetChangedFlag = true;
pushSnapshotAndRecompute({ delta: 50, label: '冷却后再切' });

console.log('\n=== 场景 3：长工具链 PTC——连续调用 6 次工具 ===');
consecutiveToolCalls = 0;
for (let i = 0; i < 6; i++) {
  consecutiveToolCalls += 1;
  pushSnapshotAndRecompute({ delta: 200, label: '连续工具调用' });
  now += 1500;
}

console.log('\n=== 场景 4：message_over_threshold（25 条后持续无缓存复用）===');
// 先把 messageCount 推到 25 以上
for (let i = 0; i < 26; i++) {
  consecutiveToolCalls = 0; // 不连续工具
  pushSnapshotAndRecompute({ delta: 100, label: '无复用消息' });
  now += 1000;
}
console.log(`\n当前灵敏度: standard, messageThreshold=${profile.messageThreshold}, bloatThreshold=${profile.bloatThreshold}, PTC阈值=${profile.consecutiveToolCallsForPtc}`);

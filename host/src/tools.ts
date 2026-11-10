import type { Disposer, DshHostContext, DshToolDefinition } from './types/dshContext.ts';
import type { HealthSignal } from './model/healthSignal.ts';
import type { TriggerReason } from './model/types.ts';
import type { HostLightApi } from './hostLightApi.ts';
import { guard } from './staleGuard.ts';

/**
 * 缓存可能失效时给用户看的一行建议（≤20 字）。
 * 原来由 client 侧渲染层展示，client 不作为发布物后，文案由工具输出承载。
 */
const HINTS: Record<TriggerReason, string> = {
  system_prompt_rewrite: '系统提示重复，建议归档旧消息',
  toolset_change: '工具集变更，建议收敛或开 PTC',
  message_over_threshold: '消息过多未命中，建议开新会话',
  context_bloat_no_reuse: '建议检查会话上下文',
};

const PTC_HINT = '长工具链建议开启 PTC 缓存';

export function hintFor(signal: HealthSignal): string {
  if (signal.ptcHintActive) return PTC_HINT;
  if (signal.level === 'yellow' || signal.level === 'red') {
    return signal.triggerReason ? HINTS[signal.triggerReason] : '';
  }
  return '';
}

const CONFIG_SCHEMA = {
  type: 'object',
  properties: {
    enabled: { type: 'boolean' },
    sensitivity: { type: 'string', enum: ['loose', 'standard', 'aggressive'] },
    showPtcHint: { type: 'boolean' },
  },
  required: ['enabled', 'sensitivity', 'showPtcHint'],
  additionalProperties: false,
};

const SUMMARY_SCHEMA = {
  type: 'object',
  properties: {
    messageCount: { type: 'number' },
    toolsetHash: { type: 'string' },
    systemPromptHash: { type: 'string' },
  },
  required: ['messageCount', 'toolsetHash', 'systemPromptHash'],
  additionalProperties: false,
};

export function createCacheGuardTools(api: HostLightApi): DshToolDefinition[] {
  const healthTool: DshToolDefinition = {
    name: 'cache_guard_health',
    description:
      'Read the current cache-health signal for this session: green/yellow/red level, trigger reason, a one-line intervention hint, and the PTC suggestion state.',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
    output: {
      schema: {
        type: 'object',
        properties: {
          level: { type: 'string', enum: ['green', 'yellow', 'red', 'none'] },
          hint: { type: 'string' },
          triggerReason: { type: 'string' },
          ptcHintActive: { type: 'boolean' },
          sensitivity: { type: 'string' },
          summary: SUMMARY_SCHEMA,
        },
        required: ['level', 'hint', 'triggerReason', 'ptcHintActive', 'sensitivity', 'summary'],
        additionalProperties: false,
      },
      render: (_args, value) => {
        const lines = [`cache-guard: ${String(value.level)}`];
        if (typeof value.hint === 'string' && value.hint.length > 0) lines.push(`hint: ${value.hint}`);
        if (typeof value.triggerReason === 'string' && value.triggerReason.length > 0) {
          lines.push(`reason: ${value.triggerReason}`);
        }
        lines.push(`sensitivity: ${String(value.sensitivity)}`);
        return [{ type: 'text', text: lines.join('\n') }];
      },
    },
    execute: async () => {
      const config = await api.getPluginConfig();
      const signal = guard(await api.getHealthSignal(), Date.now());
      const summary = signal.sessionWindowSummary;
      return {
        level: signal.level,
        hint: hintFor(signal),
        triggerReason: signal.triggerReason ?? '',
        ptcHintActive: signal.ptcHintActive,
        sensitivity: config.sensitivity,
        summary: {
          messageCount: summary ? summary.messageCount : 0,
          toolsetHash: summary ? summary.toolsetHash : '',
          systemPromptHash: summary ? summary.systemPromptHash : '',
        },
      };
    },
  };

  const configTool: DshToolDefinition = {
    name: 'cache_guard_config',
    description:
      'Read or update cache-guard settings (enabled / sensitivity / showPtcHint). Updates apply to the running plugin instance only.',
    parameters: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        sensitivity: { type: 'string', enum: ['loose', 'standard', 'aggressive'] },
        showPtcHint: { type: 'boolean' },
      },
      additionalProperties: false,
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          config: CONFIG_SCHEMA,
          errorCode: { type: 'string' },
        },
        required: ['config', 'errorCode'],
        additionalProperties: false,
      },
      render: (_args, value) => {
        const config = value.config as Record<string, unknown>;
        const lines = [
          `enabled=${String(config.enabled)}`,
          `sensitivity=${String(config.sensitivity)}`,
          `showPtcHint=${String(config.showPtcHint)}`,
        ];
        if (typeof value.errorCode === 'string' && value.errorCode.length > 0) {
          lines.push(`error: ${value.errorCode}`);
        }
        return [{ type: 'text', text: lines.join('\n') }];
      },
    },
    execute: async (args) => {
      const patch: Record<string, unknown> = {};
      if (typeof args.enabled === 'boolean') patch.enabled = args.enabled;
      if (typeof args.sensitivity === 'string') patch.sensitivity = args.sensitivity;
      if (typeof args.showPtcHint === 'boolean') patch.showPtcHint = args.showPtcHint;

      if (Object.keys(patch).length === 0) {
        const config = await api.getPluginConfig();
        return { config: { ...config }, errorCode: '' };
      }
      const result = await api.setPluginConfig(patch);
      return { config: { ...result.config }, errorCode: result.errorCode ?? '' };
    },
  };

  return [healthTool, configTool];
}

export function registerCacheGuardTools(ctx: DshHostContext, api: HostLightApi): Disposer[] {
  const register = ctx.tools?.register;
  if (typeof register !== 'function') return [];
  return createCacheGuardTools(api).map((definition) => register.call(ctx.tools, definition));
}

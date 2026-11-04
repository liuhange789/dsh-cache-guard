import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HostClient } from '../hostClient.ts';
import type { DshClientContext, Disposer } from '../types/clientContext.ts';
import type { HealthSignal, PluginConfig } from '../model/types.ts';

function makeMockCtx(): DshClientContext & { callLog: { method: string; args: unknown[] }[] } {
  const callLog: { method: string; args: unknown[] }[] = [];
  return {
    callLog,
    host: {
      call: vi.fn(async (method: string, ...args: unknown[]) => {
        callLog.push({ method, args });
        if (method === 'getHealthSignal') {
          return { level: 'yellow', triggerReason: 'toolset_change', computedAt: Date.now(), sessionWindowSummary: null, ptcHintActive: false } satisfies HealthSignal;
        }
        if (method === 'getPluginConfig') {
          return { enabled: true, sensitivity: 'standard', showPtcHint: true } satisfies PluginConfig;
        }
        if (method === 'setPluginConfig') {
          return { config: { enabled: true, sensitivity: 'aggressive', showPtcHint: true }, errorCode: null };
        }
        return null;
      }),
      subscribe: vi.fn(() => () => {}),
    },
    ui: {
      statusBar: { mount: vi.fn(), unmount: vi.fn() },
      hintArea: { mount: vi.fn(), unmount: vi.fn() },
      settings: { mount: vi.fn(), unmount: vi.fn() },
    },
    log: vi.fn(),
  };
}

describe('RPC Integration', () => {
  let ctx: ReturnType<typeof makeMockCtx>;
  let client: HostClient;

  beforeEach(() => {
    ctx = makeMockCtx();
    client = new HostClient(ctx);
  });

  it('getHealthSignal 返回与 Host 一致', async () => {
    const signal = await client.getHealthSignal();
    expect(signal.level).toBe('yellow');
    expect(signal.triggerReason).toBe('toolset_change');
  });

  it('getPluginConfig 返回合法配置', async () => {
    const config = await client.getPluginConfig();
    expect(config.sensitivity).toBe('standard');
  });

  it('setPluginConfig 写回后一致', async () => {
    const result = await client.setPluginConfig({ sensitivity: 'aggressive' });
    expect(result.config.sensitivity).toBe('aggressive');
    expect(result.errorCode).toBeNull();
  });

  it('通道异常降级为 none', async () => {
    vi.mocked(ctx.host.call).mockRejectedValue(new Error('fail'));
    const signal = await client.getHealthSignal();
    expect(signal.level).toBe('none');
  });
});
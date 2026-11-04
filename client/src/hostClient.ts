import type { DshClientContext, Disposer } from './types/clientContext.ts';
import type { HealthSignal, PluginConfig, ApiWriteResult } from './model/types.ts';

export class HostClient {
  private readonly ctx: DshClientContext;

  constructor(ctx: DshClientContext) {
    this.ctx = ctx;
  }

  async getHealthSignal(): Promise<HealthSignal> {
    try {
      const result = await this.ctx.host.call('getHealthSignal');
      return result as HealthSignal;
    } catch {
      return {
        level: 'none',
        triggerReason: null,
        computedAt: 0,
        sessionWindowSummary: null,
        ptcHintActive: false,
      };
    }
  }

  async getPluginConfig(): Promise<PluginConfig> {
    try {
      const result = await this.ctx.host.call('getPluginConfig');
      return result as PluginConfig;
    } catch {
      return { enabled: true, sensitivity: 'standard', showPtcHint: true };
    }
  }

  async setPluginConfig(patch: Partial<PluginConfig>): Promise<ApiWriteResult> {
    try {
      const result = await this.ctx.host.call('setPluginConfig', patch);
      return result as ApiWriteResult;
    } catch {
      return {
        config: { enabled: true, sensitivity: 'standard', showPtcHint: true },
        errorCode: 'CFG_WRITE_FAILED',
      };
    }
  }

  subscribeSignalPush(handler: (signal: HealthSignal) => void): Disposer {
    return this.ctx.host.subscribe('onSignalPush', (payload: unknown) => {
      handler(payload as HealthSignal);
    });
  }
}
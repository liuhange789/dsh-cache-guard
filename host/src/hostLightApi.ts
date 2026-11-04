import type { HealthSignal } from './model/healthSignal.ts';
import { createNoneSignal } from './model/healthSignal.ts';
import type { PluginConfig } from './model/pluginConfig.ts';
import type { ConfigStore, ConfigWriteResult } from './config/configStore.ts';
import type { DshHostContext } from './types/dshContext.ts';
import type { LifecycleManager } from './lifecycleManager.ts';

export interface HostLightApiDeps {
  ctx: DshHostContext;
  configStore: ConfigStore;
  lifecycle: LifecycleManager;
  getSignal: () => HealthSignal;
  setSignal: (signal: HealthSignal) => void;
}

export interface ApiWriteResult extends ConfigWriteResult {
  config: PluginConfig;
}

export class HostLightApi {
  private readonly deps: HostLightApiDeps;

  constructor(deps: HostLightApiDeps) {
    this.deps = deps;
  }

  async getHealthSignal(): Promise<HealthSignal> {
    if (!this.deps.lifecycle.isLoaded()) {
      return createNoneSignal(Date.now());
    }
    return this.deps.getSignal();
  }

  async getPluginConfig(): Promise<PluginConfig> {
    return this.deps.configStore.read();
  }

  async setPluginConfig(patch: Partial<PluginConfig>): Promise<ApiWriteResult> {
    const result = await this.deps.configStore.write(patch);
    return { config: result.config, errorCode: result.errorCode };
  }

  pushSignal(signal: HealthSignal): void {
    if (!this.deps.lifecycle.isLoaded()) return;
    try {
      this.deps.ctx.push('onSignalPush', signal);
    } catch {
      this.deps.ctx.log('warn', 'HostLightApi: pushSignal failed');
    }
  }

  register(): void {
    this.deps.ctx.expose('getHealthSignal', () => this.getHealthSignal());
    this.deps.ctx.expose('getPluginConfig', () => this.getPluginConfig());
    this.deps.ctx.expose('setPluginConfig', (...args: unknown[]) =>
      this.setPluginConfig(args[0] as Partial<PluginConfig>),
    );
  }
}
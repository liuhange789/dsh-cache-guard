import type { HealthSignal } from './model/healthSignal.ts';
import { createNoneSignal } from './model/healthSignal.ts';
import type { PluginConfig } from './model/pluginConfig.ts';
import type { ConfigStore, ConfigWriteResult } from './config/configStore.ts';

export interface HostLightApiDeps {
  configStore: ConfigStore;
  getSignal: () => HealthSignal;
  isLoaded: () => boolean;
}

export interface ApiWriteResult extends ConfigWriteResult {
  config: PluginConfig;
}

/**
 * 原来这一层通过 ctx.expose 把三个方法暴露给浏览器侧；DSH 的 Context 上没有 expose，
 * 也没有 host→client 的推送通道，所以这里退化成插件内部的数据访问层，
 * 由 cache_guard_health / cache_guard_config 两个工具对外提供同样的能力。
 */
export class HostLightApi {
  private readonly deps: HostLightApiDeps;

  constructor(deps: HostLightApiDeps) {
    this.deps = deps;
  }

  async getHealthSignal(): Promise<HealthSignal> {
    if (!this.deps.isLoaded()) {
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
}

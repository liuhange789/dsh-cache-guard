import type { HealthSignal } from './model/healthSignal.ts';
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
export declare class HostLightApi {
    private readonly deps;
    constructor(deps: HostLightApiDeps);
    getHealthSignal(): Promise<HealthSignal>;
    getPluginConfig(): Promise<PluginConfig>;
    setPluginConfig(patch: Partial<PluginConfig>): Promise<ApiWriteResult>;
}
//# sourceMappingURL=hostLightApi.d.ts.map
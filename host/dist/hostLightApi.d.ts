import type { HealthSignal } from './model/healthSignal.ts';
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
export declare class HostLightApi {
    private readonly deps;
    constructor(deps: HostLightApiDeps);
    getHealthSignal(): Promise<HealthSignal>;
    getPluginConfig(): Promise<PluginConfig>;
    setPluginConfig(patch: Partial<PluginConfig>): Promise<ApiWriteResult>;
    pushSignal(signal: HealthSignal): void;
    register(): void;
}

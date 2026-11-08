import type { DshClientContext, Disposer } from './types/clientContext.ts';
import type { HealthSignal, PluginConfig, ApiWriteResult } from './model/types.ts';
export declare class HostClient {
    private readonly ctx;
    constructor(ctx: DshClientContext);
    getHealthSignal(): Promise<HealthSignal>;
    getPluginConfig(): Promise<PluginConfig>;
    setPluginConfig(patch: Partial<PluginConfig>): Promise<ApiWriteResult>;
    subscribeSignalPush(handler: (signal: HealthSignal) => void): Disposer;
}

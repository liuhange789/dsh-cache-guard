import type { PluginConfig } from '../model/pluginConfig.ts';
import type { DshHostContext } from '../types/dshContext.ts';
import type { Disposer } from '../types/dshContext.ts';
export declare const ERR_CFG_WRITE_FAILED = "CFG_WRITE_FAILED";
export declare const ERR_INVALID_SENSITIVITY = "INVALID_SENSITIVITY";
export interface ConfigWriteResult {
    config: PluginConfig;
    errorCode: string | null;
}
export declare class ConfigStore {
    private current;
    private readonly ctx;
    constructor(ctx?: DshHostContext | null);
    read(): PluginConfig;
    load(): Promise<PluginConfig>;
    write(patch: Partial<PluginConfig>): Promise<ConfigWriteResult>;
    subscribe(handler: (config: PluginConfig) => void): Disposer;
    private normalize;
}

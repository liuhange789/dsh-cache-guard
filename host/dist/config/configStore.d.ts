import type { PluginConfig } from '../model/pluginConfig.ts';
import type { Disposer, LogFn } from '../types/dshContext.ts';
export declare const ERR_INVALID_SENSITIVITY = "INVALID_SENSITIVITY";
export interface ConfigWriteResult {
    config: PluginConfig;
    errorCode: string | null;
}
/**
 * 配置来源是装载时传入的 cordis config（`pluginConfig`），不再是虚构的运行期 config 服务。
 * read/load/write/subscribe 的语义保持不变：write 只对当前插件实例生效，并通知订阅者。
 */
export declare class ConfigStore {
    private current;
    private readonly log;
    private readonly subscribers;
    constructor(initial?: Record<string, unknown> | null, log?: LogFn | null);
    read(): PluginConfig;
    load(): Promise<PluginConfig>;
    write(patch: Partial<PluginConfig>): Promise<ConfigWriteResult>;
    subscribe(handler: (config: PluginConfig) => void): Disposer;
    private normalize;
}
//# sourceMappingURL=configStore.d.ts.map
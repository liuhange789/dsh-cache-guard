import type { Sensitivity } from './types.ts';
export interface PluginConfig {
    enabled: boolean;
    sensitivity: Sensitivity;
    showPtcHint: boolean;
}
export declare const DEFAULT_PLUGIN_CONFIG: PluginConfig;
export declare function clonePluginConfig(config: PluginConfig): PluginConfig;
//# sourceMappingURL=pluginConfig.d.ts.map
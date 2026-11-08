import type { HealthSignal } from './model/healthSignal.ts';
import type { PluginConfig } from './model/pluginConfig.ts';
import type { Sensitivity } from './model/types.ts';
import type { DshHostContext } from './types/dshContext.ts';
export declare class AuditLogger {
    private readonly ctx;
    constructor(ctx?: DshHostContext | null);
    logSignalChange(prev: HealthSignal, next: HealthSignal, sensitivity: Sensitivity): void;
    logConfigChange(prev: PluginConfig, next: PluginConfig): void;
}

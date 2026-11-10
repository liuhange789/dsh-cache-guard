import type { HealthSignal } from './model/healthSignal.ts';
import type { PluginConfig } from './model/pluginConfig.ts';
import type { Sensitivity } from './model/types.ts';
import type { LogFn } from './types/dshContext.ts';
export declare class AuditLogger {
    private readonly log;
    constructor(log?: LogFn | null);
    logSignalChange(prev: HealthSignal, next: HealthSignal, sensitivity: Sensitivity): void;
    logConfigChange(prev: PluginConfig, next: PluginConfig): void;
}
//# sourceMappingURL=auditLogger.d.ts.map
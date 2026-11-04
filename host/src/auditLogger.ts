import type { HealthSignal } from './model/healthSignal.ts';
import type { PluginConfig } from './model/pluginConfig.ts';
import type { Sensitivity } from './model/types.ts';
import type { DshHostContext } from './types/dshContext.ts';

export class AuditLogger {
  private readonly ctx: DshHostContext | null;

  constructor(ctx: DshHostContext | null = null) {
    this.ctx = ctx;
  }

  logSignalChange(
    prev: HealthSignal,
    next: HealthSignal,
    sensitivity: Sensitivity,
  ): void {
    if (prev.level === next.level && prev.triggerReason === next.triggerReason) {
      return;
    }
    this.ctx?.log('info', 'signal_change', {
      from: prev.level,
      to: next.level,
      triggerReason: next.triggerReason,
      sensitivity,
      summary: next.sessionWindowSummary,
    });
  }

  logConfigChange(
    prev: PluginConfig,
    next: PluginConfig,
  ): void {
    if (prev.sensitivity !== next.sensitivity) {
      this.ctx?.log('info', 'config_change', {
        field: 'sensitivity',
        from: prev.sensitivity,
        to: next.sensitivity,
      });
    }
    if (prev.showPtcHint !== next.showPtcHint) {
      this.ctx?.log('info', 'config_change', {
        field: 'showPtcHint',
        from: prev.showPtcHint,
        to: next.showPtcHint,
      });
    }
    if (prev.enabled !== next.enabled) {
      this.ctx?.log('info', 'config_change', {
        field: 'enabled',
        from: prev.enabled,
        to: next.enabled,
      });
    }
  }
}
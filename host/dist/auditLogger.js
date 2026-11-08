export class AuditLogger {
    ctx;
    constructor(ctx = null) {
        this.ctx = ctx;
    }
    logSignalChange(prev, next, sensitivity) {
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
    logConfigChange(prev, next) {
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
//# sourceMappingURL=auditLogger.js.map
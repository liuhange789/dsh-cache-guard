export class HostClient {
    ctx;
    constructor(ctx) {
        this.ctx = ctx;
    }
    async getHealthSignal() {
        try {
            const result = await this.ctx.host.call('getHealthSignal');
            return result;
        }
        catch {
            return {
                level: 'none',
                triggerReason: null,
                computedAt: 0,
                sessionWindowSummary: null,
                ptcHintActive: false,
            };
        }
    }
    async getPluginConfig() {
        try {
            const result = await this.ctx.host.call('getPluginConfig');
            return result;
        }
        catch {
            return { enabled: true, sensitivity: 'standard', showPtcHint: true };
        }
    }
    async setPluginConfig(patch) {
        try {
            const result = await this.ctx.host.call('setPluginConfig', patch);
            return result;
        }
        catch {
            return {
                config: { enabled: true, sensitivity: 'standard', showPtcHint: true },
                errorCode: 'CFG_WRITE_FAILED',
            };
        }
    }
    subscribeSignalPush(handler) {
        return this.ctx.host.subscribe('onSignalPush', (payload) => {
            handler(payload);
        });
    }
}
//# sourceMappingURL=hostClient.js.map
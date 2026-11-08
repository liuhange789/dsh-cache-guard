import { createNoneSignal } from './model/healthSignal.ts';
export class HostLightApi {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    async getHealthSignal() {
        if (!this.deps.lifecycle.isLoaded()) {
            return createNoneSignal(Date.now());
        }
        return this.deps.getSignal();
    }
    async getPluginConfig() {
        return this.deps.configStore.read();
    }
    async setPluginConfig(patch) {
        const result = await this.deps.configStore.write(patch);
        return { config: result.config, errorCode: result.errorCode };
    }
    pushSignal(signal) {
        if (!this.deps.lifecycle.isLoaded())
            return;
        try {
            this.deps.ctx.push('onSignalPush', signal);
        }
        catch {
            this.deps.ctx.log('warn', 'HostLightApi: pushSignal failed');
        }
    }
    register() {
        this.deps.ctx.expose('getHealthSignal', () => this.getHealthSignal());
        this.deps.ctx.expose('getPluginConfig', () => this.getPluginConfig());
        this.deps.ctx.expose('setPluginConfig', (...args) => this.setPluginConfig(args[0]));
    }
}
//# sourceMappingURL=hostLightApi.js.map
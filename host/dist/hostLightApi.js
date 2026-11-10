import { createNoneSignal } from "./model/healthSignal.js";
/**
 * 原来这一层通过 ctx.expose 把三个方法暴露给浏览器侧；DSH 的 Context 上没有 expose，
 * 也没有 host→client 的推送通道，所以这里退化成插件内部的数据访问层，
 * 由 cache_guard_health / cache_guard_config 两个工具对外提供同样的能力。
 */
export class HostLightApi {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    async getHealthSignal() {
        if (!this.deps.isLoaded()) {
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
}
//# sourceMappingURL=hostLightApi.js.map
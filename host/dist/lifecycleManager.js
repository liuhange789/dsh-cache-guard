import { createLog } from "./types/dshContext.js";
const REQUIRED_INJECTS = ['tools'];
export class LifecycleManager {
    disposers = [];
    loaded = false;
    validateInject(ctx) {
        for (const req of REQUIRED_INJECTS) {
            const service = ctx[req];
            if (!service || typeof service !== 'object') {
                createLog(ctx)('error', 'LifecycleManager: missing required inject', { missing: req });
                return false;
            }
        }
        if (typeof ctx.tools?.register !== 'function') {
            createLog(ctx)('error', 'LifecycleManager: tools.register unavailable');
            return false;
        }
        return true;
    }
    registerDisposer(fn) {
        this.disposers.push(fn);
    }
    markLoaded() {
        this.loaded = true;
    }
    isLoaded() {
        return this.loaded;
    }
    disposeAll() {
        while (this.disposers.length > 0) {
            const disposer = this.disposers.pop();
            if (disposer) {
                try {
                    disposer();
                }
                catch {
                    // disposer errors must not propagate
                }
            }
        }
        this.loaded = false;
    }
    disposeCount() {
        return this.disposers.length;
    }
}
//# sourceMappingURL=lifecycleManager.js.map
const REQUIRED_INJECTS = ['agents', 'tools'];
export class LifecycleManager {
    disposers = [];
    loaded = false;
    validateInject(ctx) {
        const inject = ctx.inject;
        for (const req of REQUIRED_INJECTS) {
            if (!inject.includes(req)) {
                ctx.log('error', 'LifecycleManager: missing required inject', { missing: req });
                return false;
            }
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

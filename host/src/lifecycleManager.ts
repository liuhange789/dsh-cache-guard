import type { Disposer } from './types/dshContext.ts';
import type { DshHostContext } from './types/dshContext.ts';
import { createLog } from './types/dshContext.ts';

const REQUIRED_INJECTS: readonly string[] = ['tools'];

export class LifecycleManager {
  private readonly disposers: Disposer[] = [];
  private loaded = false;

  validateInject(ctx: DshHostContext): boolean {
    for (const req of REQUIRED_INJECTS) {
      const service = ctx[req as 'tools'];
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

  registerDisposer(fn: Disposer): void {
    this.disposers.push(fn);
  }

  markLoaded(): void {
    this.loaded = true;
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  disposeAll(): void {
    while (this.disposers.length > 0) {
      const disposer = this.disposers.pop();
      if (disposer) {
        try {
          disposer();
        } catch {
          // disposer errors must not propagate
        }
      }
    }
    this.loaded = false;
  }

  disposeCount(): number {
    return this.disposers.length;
  }
}

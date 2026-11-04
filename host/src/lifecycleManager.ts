import type { Disposer } from './types/dshContext.ts';
import type { DshHostContext } from './types/dshContext.ts';

const REQUIRED_INJECTS: readonly string[] = ['agents', 'tools'];

export class LifecycleManager {
  private readonly disposers: Disposer[] = [];
  private loaded = false;

  validateInject(ctx: DshHostContext): boolean {
    const inject = ctx.inject;
    for (const req of REQUIRED_INJECTS) {
      if (!inject.includes(req)) {
        ctx.log('error', 'LifecycleManager: missing required inject', { missing: req });
        return false;
      }
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
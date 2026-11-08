import type { Disposer } from './types/dshContext.ts';
import type { DshHostContext } from './types/dshContext.ts';
export declare class LifecycleManager {
    private readonly disposers;
    private loaded;
    validateInject(ctx: DshHostContext): boolean;
    registerDisposer(fn: Disposer): void;
    markLoaded(): void;
    isLoaded(): boolean;
    disposeAll(): void;
    disposeCount(): number;
}

import type { Disposer } from '../types/dshContext.ts';
import type { PipelineDeps } from './listenerState.ts';
export interface StreamFrame {
    tokenDelta?: number;
    messageCount?: number;
}
export declare function registerStreamListener(deps: PipelineDeps): Disposer;
//# sourceMappingURL=streamListener.d.ts.map
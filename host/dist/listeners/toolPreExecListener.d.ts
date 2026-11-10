import type { Disposer } from '../types/dshContext.ts';
import type { PipelineDeps } from './listenerState.ts';
export interface ToolPreExecFrame {
    toolSchemas?: string[];
}
export declare function registerToolPreExecListener(deps: PipelineDeps): Disposer;
//# sourceMappingURL=toolPreExecListener.d.ts.map
import type { Disposer } from '../types/dshContext.ts';
import type { PipelineDeps } from './listenerState.ts';
export interface SessionEventFrame {
    type?: 'system_prompt_change' | 'session_reset' | 'other';
    systemPrompt?: string;
}
export declare function registerSessionListener(deps: PipelineDeps): Disposer;

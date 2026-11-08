import type { HealthSignal } from '../model/healthSignal.ts';
import type { PluginConfig } from '../model/pluginConfig.ts';
import type { SensitivityProfile } from '../model/sensitivityProfile.ts';
import type { SnapshotWindow } from '../model/snapshotWindow.ts';
import type { SignalThrottler } from '../engine/signalThrottler.ts';
import type { DshHostContext } from '../types/dshContext.ts';
export interface ListenerState {
    messageCount: number;
    toolsetHash: string;
    systemPromptHash: string;
    contextTokenDelta: number;
    consecutiveToolCalls: number;
    lastSignalAt: number;
    toolsetChanged: boolean;
    systemPromptRewrite: boolean;
    ptcHintActive: boolean;
    prevPromptHashes: number[];
    currentSignal: HealthSignal;
}
export declare function createListenerState(): ListenerState;
export interface PipelineDeps {
    ctx: DshHostContext;
    window: SnapshotWindow;
    throttler: SignalThrottler;
    getConfig: () => PluginConfig;
    getProfile: () => SensitivityProfile;
    state: ListenerState;
    onSignalChange: (signal: HealthSignal) => void;
}
export declare function recomputeAndPush(deps: PipelineDeps, now: number): void;
export declare function resetStateForNewSession(deps: PipelineDeps, now: number): void;

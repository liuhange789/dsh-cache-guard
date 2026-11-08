export type Level = 'green' | 'yellow' | 'red' | 'none';
export type TriggerReason = 'system_prompt_rewrite' | 'toolset_change' | 'message_over_threshold' | 'context_bloat_no_reuse';
export type Sensitivity = 'loose' | 'standard' | 'aggressive';
export interface PluginConfig {
    enabled: boolean;
    sensitivity: Sensitivity;
    showPtcHint: boolean;
}
export interface SessionWindowSummary {
    messageCount: number;
    toolsetHash: string;
    systemPromptHash: string;
}
export interface HealthSignal {
    level: Level;
    triggerReason: TriggerReason | null;
    computedAt: number;
    sessionWindowSummary: SessionWindowSummary | null;
    ptcHintActive: boolean;
}
export interface ApiWriteResult {
    config: PluginConfig;
    errorCode: string | null;
}

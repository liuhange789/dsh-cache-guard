export type Level = 'green' | 'yellow' | 'red' | 'none';
export type TriggerReason = 'system_prompt_rewrite' | 'toolset_change' | 'message_over_threshold' | 'context_bloat_no_reuse';
export type Sensitivity = 'loose' | 'standard' | 'aggressive';
export declare const NONE_SIGNAL_LEVEL: Level;
export declare const VALID_SENSITIVITIES: readonly Sensitivity[];
export declare const VALID_TRIGGER_REASONS: readonly TriggerReason[];
export declare function isSensitivity(value: unknown): value is Sensitivity;
export declare function isTriggerReason(value: unknown): value is TriggerReason;
//# sourceMappingURL=types.d.ts.map
export const NONE_SIGNAL_LEVEL = 'none';
export const VALID_SENSITIVITIES = [
    'loose',
    'standard',
    'aggressive',
];
export const VALID_TRIGGER_REASONS = [
    'system_prompt_rewrite',
    'toolset_change',
    'message_over_threshold',
    'context_bloat_no_reuse',
];
export function isSensitivity(value) {
    return (typeof value === 'string' &&
        VALID_SENSITIVITIES.includes(value));
}
export function isTriggerReason(value) {
    return (typeof value === 'string' &&
        VALID_TRIGGER_REASONS.includes(value));
}
//# sourceMappingURL=types.js.map
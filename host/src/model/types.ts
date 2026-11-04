export type Level = 'green' | 'yellow' | 'red' | 'none';

export type TriggerReason =
  | 'system_prompt_rewrite'
  | 'toolset_change'
  | 'message_over_threshold'
  | 'context_bloat_no_reuse';

export type Sensitivity = 'loose' | 'standard' | 'aggressive';

export const NONE_SIGNAL_LEVEL: Level = 'none';

export const VALID_SENSITIVITIES: readonly Sensitivity[] = [
  'loose',
  'standard',
  'aggressive',
] as const;

export const VALID_TRIGGER_REASONS: readonly TriggerReason[] = [
  'system_prompt_rewrite',
  'toolset_change',
  'message_over_threshold',
  'context_bloat_no_reuse',
] as const;

export function isSensitivity(value: unknown): value is Sensitivity {
  return (
    typeof value === 'string' &&
    (VALID_SENSITIVITIES as readonly string[]).includes(value)
  );
}

export function isTriggerReason(value: unknown): value is TriggerReason {
  return (
    typeof value === 'string' &&
    (VALID_TRIGGER_REASONS as readonly string[]).includes(value)
  );
}
import type { TriggerReason } from './model/types.ts';
export declare function getYellowHint(reason: TriggerReason): string;
export declare function getPtcHint(): string;
export declare function getFallback(): string;
export declare function truncateHint(text: string): string;
export declare const MAX_HINT_LENGTH = 20;

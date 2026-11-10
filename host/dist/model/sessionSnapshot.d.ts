export interface SessionWindowSummary {
    messageCount: number;
    toolsetHash: string;
    systemPromptHash: string;
}
export interface SessionSnapshot {
    messageCount: number;
    toolsetHash: string;
    systemPromptHash: string;
    contextTokenDelta: number;
    consecutiveToolCalls: number;
    lastSignalAt: number;
    capturedAt: number;
}
export declare function createSessionSnapshot(fields: Omit<SessionSnapshot, 'capturedAt'> & {
    capturedAt?: number;
}): SessionSnapshot;
export declare function toSummary(snapshot: SessionSnapshot): SessionWindowSummary;
export declare function byteSize(snapshot: SessionSnapshot): number;
//# sourceMappingURL=sessionSnapshot.d.ts.map
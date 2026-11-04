export function createSessionSnapshot(fields) {
    return {
        messageCount: fields.messageCount,
        toolsetHash: fields.toolsetHash,
        systemPromptHash: fields.systemPromptHash,
        contextTokenDelta: fields.contextTokenDelta,
        consecutiveToolCalls: fields.consecutiveToolCalls,
        lastSignalAt: fields.lastSignalAt,
        capturedAt: fields.capturedAt ?? Date.now(),
    };
}
export function toSummary(snapshot) {
    return {
        messageCount: snapshot.messageCount,
        toolsetHash: snapshot.toolsetHash,
        systemPromptHash: snapshot.systemPromptHash,
    };
}
export function byteSize(snapshot) {
    return (snapshot.toolsetHash.length +
        snapshot.systemPromptHash.length +
        48);
}

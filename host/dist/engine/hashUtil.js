export function fnv1aHash(input) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
}
export function hashToolset(toolSchemas) {
    const sorted = [...toolSchemas].sort();
    return fnv1aHash(sorted.join('|'));
}
export function hashSystemPrompt(prompt) {
    return fnv1aHash(prompt);
}
//# sourceMappingURL=hashUtil.js.map
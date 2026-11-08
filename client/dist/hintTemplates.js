const HINT_MAX_LENGTH = 20;
const YELLOW_HINTS = {
    system_prompt_rewrite: '系统提示重复，建议归档旧消息',
    toolset_change: '工具集变更，建议收敛或开 PTC',
    message_over_threshold: '消息过多未命中，建议开新会话',
    context_bloat_no_reuse: '建议检查会话上下文',
};
const PTC_HINT = '长工具链建议开启 PTC 缓存';
const FALLBACK_HINT = '建议检查会话上下文';
export function getYellowHint(reason) {
    return YELLOW_HINTS[reason] ?? FALLBACK_HINT;
}
export function getPtcHint() {
    return PTC_HINT;
}
export function getFallback() {
    return FALLBACK_HINT;
}
export function truncateHint(text) {
    if (text.length <= HINT_MAX_LENGTH)
        return text;
    return text.slice(0, HINT_MAX_LENGTH - 1) + '…';
}
export const MAX_HINT_LENGTH = HINT_MAX_LENGTH;
//# sourceMappingURL=hintTemplates.js.map
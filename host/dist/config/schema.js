import Schema from '@deepseek-ai/schemastery';
export const configSchema = Schema.object({
    enabled: Schema.boolean().default(true),
    sensitivity: Schema.union([
        Schema.const('loose'),
        Schema.const('standard'),
        Schema.const('aggressive'),
    ]).default('standard'),
    showPtcHint: Schema.boolean().default(true),
});
//# sourceMappingURL=schema.js.map
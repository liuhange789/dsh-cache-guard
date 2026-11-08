import { DEFAULT_PLUGIN_CONFIG, clonePluginConfig } from '../model/pluginConfig.ts';
import { isSensitivity } from '../model/types.ts';
export const ERR_CFG_WRITE_FAILED = 'CFG_WRITE_FAILED';
export const ERR_INVALID_SENSITIVITY = 'INVALID_SENSITIVITY';
export class ConfigStore {
    current = clonePluginConfig(DEFAULT_PLUGIN_CONFIG);
    ctx;
    constructor(ctx = null) {
        this.ctx = ctx;
    }
    read() {
        return clonePluginConfig(this.current);
    }
    async load() {
        if (!this.ctx) {
            return this.read();
        }
        try {
            const raw = await this.ctx.config.read();
            if (!raw) {
                this.current = clonePluginConfig(DEFAULT_PLUGIN_CONFIG);
                return this.read();
            }
            this.current = this.normalize(raw);
            return this.read();
        }
        catch {
            this.ctx.log('warn', 'ConfigStore: config read failed, using defaults');
            this.current = clonePluginConfig(DEFAULT_PLUGIN_CONFIG);
            return this.read();
        }
    }
    async write(patch) {
        if (patch.sensitivity !== undefined && !isSensitivity(patch.sensitivity)) {
            return { config: this.read(), errorCode: ERR_INVALID_SENSITIVITY };
        }
        const next = {
            enabled: patch.enabled ?? this.current.enabled,
            sensitivity: (patch.sensitivity ?? this.current.sensitivity),
            showPtcHint: patch.showPtcHint ?? this.current.showPtcHint,
        };
        if (!this.ctx) {
            this.current = next;
            return { config: this.read(), errorCode: null };
        }
        try {
            await this.ctx.config.write(next);
            this.current = next;
            return { config: this.read(), errorCode: null };
        }
        catch {
            this.ctx.log('warn', 'ConfigStore: config write failed', { code: ERR_CFG_WRITE_FAILED });
            return { config: this.read(), errorCode: ERR_CFG_WRITE_FAILED };
        }
    }
    subscribe(handler) {
        if (!this.ctx) {
            return () => { };
        }
        return this.ctx.config.subscribe((raw) => {
            this.current = this.normalize(raw);
            handler(this.read());
        });
    }
    normalize(raw) {
        const enabled = typeof raw.enabled === 'boolean' ? raw.enabled : DEFAULT_PLUGIN_CONFIG.enabled;
        const sensitivity = isSensitivity(raw.sensitivity)
            ? raw.sensitivity
            : DEFAULT_PLUGIN_CONFIG.sensitivity;
        if (raw.sensitivity !== undefined && !isSensitivity(raw.sensitivity)) {
            this.ctx?.log('warn', 'ConfigStore: invalid sensitivity, falling back to standard', {
                received: raw.sensitivity,
            });
        }
        const showPtcHint = typeof raw.showPtcHint === 'boolean'
            ? raw.showPtcHint
            : DEFAULT_PLUGIN_CONFIG.showPtcHint;
        return { enabled, sensitivity, showPtcHint };
    }
}
//# sourceMappingURL=configStore.js.map
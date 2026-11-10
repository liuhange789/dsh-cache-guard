import { DEFAULT_PLUGIN_CONFIG, clonePluginConfig } from "../model/pluginConfig.js";
import { isSensitivity } from "../model/types.js";
export const ERR_INVALID_SENSITIVITY = 'INVALID_SENSITIVITY';
/**
 * 配置来源是装载时传入的 cordis config（`pluginConfig`），不再是虚构的运行期 config 服务。
 * read/load/write/subscribe 的语义保持不变：write 只对当前插件实例生效，并通知订阅者。
 */
export class ConfigStore {
    current = clonePluginConfig(DEFAULT_PLUGIN_CONFIG);
    log;
    subscribers = new Set();
    constructor(initial = null, log = null) {
        this.log = log;
        this.current = this.normalize(initial ?? {});
    }
    read() {
        return clonePluginConfig(this.current);
    }
    async load() {
        return this.read();
    }
    async write(patch) {
        if (patch.sensitivity !== undefined && !isSensitivity(patch.sensitivity)) {
            return { config: this.read(), errorCode: ERR_INVALID_SENSITIVITY };
        }
        this.current = {
            enabled: patch.enabled ?? this.current.enabled,
            sensitivity: (patch.sensitivity ?? this.current.sensitivity),
            showPtcHint: patch.showPtcHint ?? this.current.showPtcHint,
        };
        const next = this.read();
        for (const handler of this.subscribers) {
            handler(next);
        }
        return { config: next, errorCode: null };
    }
    subscribe(handler) {
        this.subscribers.add(handler);
        handler(this.read());
        return () => {
            this.subscribers.delete(handler);
        };
    }
    normalize(raw) {
        const enabled = typeof raw.enabled === 'boolean' ? raw.enabled : DEFAULT_PLUGIN_CONFIG.enabled;
        const sensitivity = isSensitivity(raw.sensitivity)
            ? raw.sensitivity
            : DEFAULT_PLUGIN_CONFIG.sensitivity;
        if (raw.sensitivity !== undefined && !isSensitivity(raw.sensitivity)) {
            this.log?.('warn', 'ConfigStore: invalid sensitivity, falling back to standard', {
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
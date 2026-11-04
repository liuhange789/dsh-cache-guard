export const DEFAULT_PLUGIN_CONFIG = {
    enabled: true,
    sensitivity: 'standard',
    showPtcHint: true,
};
export function clonePluginConfig(config) {
    return {
        enabled: config.enabled,
        sensitivity: config.sensitivity,
        showPtcHint: config.showPtcHint,
    };
}

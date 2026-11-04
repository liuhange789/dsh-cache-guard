import type { Sensitivity } from './types.ts';

export interface PluginConfig {
  enabled: boolean;
  sensitivity: Sensitivity;
  showPtcHint: boolean;
}

export const DEFAULT_PLUGIN_CONFIG: PluginConfig = {
  enabled: true,
  sensitivity: 'standard',
  showPtcHint: true,
};

export function clonePluginConfig(config: PluginConfig): PluginConfig {
  return {
    enabled: config.enabled,
    sensitivity: config.sensitivity,
    showPtcHint: config.showPtcHint,
  };
}
import type { PluginConfig, ApiWriteResult } from '../model/types.ts';
export declare class SettingsPanel {
    private el;
    private currentConfig;
    private readonly onWrite;
    constructor(onWrite: (patch: Partial<PluginConfig>) => Promise<ApiWriteResult>);
    mount(container: HTMLElement): void;
    render(config: PluginConfig): void;
    private createToggleRow;
    private createRadioRow;
    private createSpacer;
    private write;
    private showInlineError;
    unmount(): void;
}

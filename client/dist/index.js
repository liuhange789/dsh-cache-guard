import { HostClient } from './hostClient.ts';
import { isStale, guard } from './staleGuard.ts';
import { StatusDot } from './ui/statusDot.ts';
import { HintLine } from './ui/hintLine.ts';
import { SettingsPanel } from './ui/settingsPanel.ts';
export async function setup(ctx) {
    const hostClient = new HostClient(ctx);
    const statusDot = new StatusDot();
    const hintLine = new HintLine((msg) => ctx.log('warn', msg));
    const settingsPanel = new SettingsPanel(async (patch) => {
        return hostClient.setPluginConfig(patch);
    });
    const statusBarContainer = document.createElement('div');
    ctx.ui.statusBar.mount(statusBarContainer);
    statusDot.mount(statusBarContainer);
    const hintContainer = document.createElement('div');
    ctx.ui.hintArea.mount(hintContainer);
    hintLine.mount(hintContainer);
    const settingsContainer = document.createElement('div');
    ctx.ui.settings.mount(settingsContainer);
    settingsPanel.mount(settingsContainer);
    const initialConfig = await hostClient.getPluginConfig();
    settingsPanel.render(initialConfig);
    const initialSignal = await hostClient.getHealthSignal();
    const guardedInitial = guard(initialSignal, Date.now());
    statusDot.render(guardedInitial.level);
    hintLine.update(guardedInitial);
    const signalDisposer = hostClient.subscribeSignalPush((signal) => {
        const now = Date.now();
        if (isStale(signal.computedAt, now)) {
            statusDot.render('none');
            hintLine.hide();
            return;
        }
        statusDot.render(signal.level);
        hintLine.update(signal);
    });
    return () => {
        signalDisposer();
        statusDot.unmount();
        hintLine.unmount();
        settingsPanel.unmount();
        ctx.ui.statusBar.unmount();
        ctx.ui.hintArea.unmount();
        ctx.ui.settings.unmount();
    };
}
//# sourceMappingURL=index.js.map
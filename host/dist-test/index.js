import { LifecycleManager } from './lifecycleManager';
import { ConfigStore } from './config/configStore';
import { resolveProfile } from './model/sensitivityProfile';
import { SnapshotWindow } from './model/snapshotWindow';
import { SignalThrottler } from './engine/signalThrottler';
import { AuditLogger } from './auditLogger';
import { HostLightApi } from './hostLightApi';
import { createListenerState } from './listeners/listenerState';
import { registerStreamListener } from './listeners/streamListener';
import { registerToolPreExecListener } from './listeners/toolPreExecListener';
import { registerSessionListener } from './listeners/sessionListener';
import { createNoneSignal } from './model/healthSignal';
import { configSchema } from './config/schema';
export const inject = ['agents', 'tools'];
export async function setup(ctx) {
    const lifecycle = new LifecycleManager();
    if (!lifecycle.validateInject(ctx)) {
        return () => { };
    }
    const configStore = new ConfigStore(ctx);
    await configStore.load();
    const auditLogger = new AuditLogger(ctx);
    const window = new SnapshotWindow();
    const throttler = new SignalThrottler();
    const state = createListenerState();
    let currentSignal = createNoneSignal(Date.now());
    let prevConfig = configStore.read();
    const getConfig = () => configStore.read();
    const getProfile = () => resolveProfile(configStore.read().sensitivity);
    const onSignalChange = (signal) => {
        auditLogger.logSignalChange(currentSignal, signal, getConfig().sensitivity);
        currentSignal = signal;
        api.pushSignal(signal);
    };
    const deps = {
        ctx,
        window,
        throttler,
        getConfig,
        getProfile,
        state,
        onSignalChange,
    };
    const api = new HostLightApi({
        ctx,
        configStore,
        lifecycle,
        getSignal: () => currentSignal,
        setSignal: (s) => { currentSignal = s; },
    });
    api.register();
    const disposer1 = registerStreamListener(deps);
    const disposer2 = registerToolPreExecListener(deps);
    const disposer3 = registerSessionListener(deps);
    const configDisposer = ctx.effect(() => {
        return configStore.subscribe((newConfig) => {
            auditLogger.logConfigChange(prevConfig, newConfig);
            prevConfig = newConfig;
        });
    });
    lifecycle.registerDisposer(disposer1);
    lifecycle.registerDisposer(disposer2);
    lifecycle.registerDisposer(disposer3);
    lifecycle.registerDisposer(configDisposer);
    lifecycle.markLoaded();
    return () => {
        lifecycle.disposeAll();
        window.clear();
        const noneSignal = createNoneSignal(Date.now());
        currentSignal = noneSignal;
        try {
            ctx.push('onSignalPush', noneSignal);
        }
        catch {
            // best effort
        }
    };
}
export { configSchema };

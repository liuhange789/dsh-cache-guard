import type { DshHostContext, Disposer } from './types/dshContext.ts';
import { LifecycleManager } from './lifecycleManager.ts';
import { ConfigStore } from './config/configStore.ts';
import { resolveProfile } from './model/sensitivityProfile.ts';
import { SnapshotWindow } from './model/snapshotWindow.ts';
import { SignalThrottler } from './engine/signalThrottler.ts';
import { AuditLogger } from './auditLogger.ts';
import { HostLightApi } from './hostLightApi.ts';
import { createListenerState, type PipelineDeps } from './listeners/listenerState.ts';
import { registerStreamListener } from './listeners/streamListener.ts';
import { registerToolPreExecListener } from './listeners/toolPreExecListener.ts';
import { registerSessionListener } from './listeners/sessionListener.ts';
import { createNoneSignal } from './model/healthSignal.ts';
import { configSchema } from './config/schema.ts';

export const inject = ['agents', 'tools'] as const;

export async function setup(ctx: DshHostContext): Promise<Disposer> {
  const lifecycle = new LifecycleManager();

  if (!lifecycle.validateInject(ctx)) {
    return () => {};
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

  const onSignalChange = (signal: typeof currentSignal): void => {
    auditLogger.logSignalChange(currentSignal, signal, getConfig().sensitivity);
    currentSignal = signal;
    api.pushSignal(signal);
  };

  const deps: PipelineDeps = {
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

  const configDisposer = ctx.effect<Disposer>(() => {
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
    } catch {
      // best effort
    }
  };
}

export { configSchema };
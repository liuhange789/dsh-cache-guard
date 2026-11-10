import type { DshHostContext, Disposer } from './types/dshContext.ts';
import { createLog } from './types/dshContext.ts';
import { LifecycleManager } from './lifecycleManager.ts';
import { ConfigStore } from './config/configStore.ts';
import { resolveProfile } from './model/sensitivityProfile.ts';
import { SnapshotWindow } from './model/snapshotWindow.ts';
import { SignalThrottler } from './engine/signalThrottler.ts';
import { AuditLogger } from './auditLogger.ts';
import { HostLightApi } from './hostLightApi.ts';
import { registerCacheGuardTools } from './tools.ts';
import { createListenerState, type PipelineDeps } from './listeners/listenerState.ts';
import { registerStreamListener } from './listeners/streamListener.ts';
import { registerToolPreExecListener } from './listeners/toolPreExecListener.ts';
import { registerSessionListener } from './listeners/sessionListener.ts';
import { createNoneSignal } from './model/healthSignal.ts';
import { configSchema } from './config/schema.ts';

/** 只依赖 tools：信号通过 cache_guard_health / cache_guard_config 两个工具对外提供。 */
export const inject = ['tools'] as const;

/**
 * 插件入口。
 * @param ctx Host Context
 * @param pluginConfig cordis 加载器传入的 config（配合下面的 configSchema）
 */
export async function apply(ctx: DshHostContext, pluginConfig?: unknown): Promise<Disposer> {
  const log = createLog(ctx);
  const lifecycle = new LifecycleManager();

  if (!lifecycle.validateInject(ctx)) {
    return () => {};
  }

  const configStore = new ConfigStore(
    typeof pluginConfig === 'object' && pluginConfig !== null
      ? (pluginConfig as Record<string, unknown>)
      : {},
    log,
  );
  await configStore.load();

  const auditLogger = new AuditLogger(log);
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

  const toolDisposers = registerCacheGuardTools(
    ctx,
    new HostLightApi({
      configStore,
      getSignal: () => currentSignal,
      isLoaded: () => lifecycle.isLoaded(),
    }),
  );

  const disposer1 = registerStreamListener(deps);
  const disposer2 = registerToolPreExecListener(deps);
  const disposer3 = registerSessionListener(deps);

  const configDisposer = ctx.effect<Disposer>(() => {
    return configStore.subscribe((newConfig) => {
      auditLogger.logConfigChange(prevConfig, newConfig);
      prevConfig = newConfig;
    });
  });

  for (const disposer of toolDisposers) lifecycle.registerDisposer(disposer);
  lifecycle.registerDisposer(disposer1);
  lifecycle.registerDisposer(disposer2);
  lifecycle.registerDisposer(disposer3);
  lifecycle.registerDisposer(configDisposer);
  lifecycle.markLoaded();

  log('info', `cache-guard: active (sensitivity=${configStore.read().sensitivity})`);

  return () => {
    lifecycle.disposeAll();
    window.clear();
    currentSignal = createNoneSignal(Date.now());
  };
}

/** 兼容只找 setup 的加载器；与 apply 是同一实现。 */
export const setup = apply;

export { configSchema };

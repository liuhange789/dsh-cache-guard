import { describe, it, expect, vi } from 'vitest';
import { ConfigStore, ERR_INVALID_SENSITIVITY } from './configStore.ts';
import { DEFAULT_PLUGIN_CONFIG } from '../model/pluginConfig.ts';

describe('ConfigStore', () => {
  it('非法 sensitivity 回退 standard 并告警', () => {
    const log = vi.fn();
    const store = new ConfigStore({ enabled: true, sensitivity: 'invalid', showPtcHint: true }, log);
    const config = store.read();
    expect(config.sensitivity).toBe('standard');
    expect(log).toHaveBeenCalledWith('warn', expect.stringContaining('invalid sensitivity'), expect.anything());
  });

  it('未传配置时使用默认值', async () => {
    const store = new ConfigStore();
    const config = await store.load();
    expect(config).toEqual(DEFAULT_PLUGIN_CONFIG);
  });

  it('写入成功返回新值', async () => {
    const store = new ConfigStore();
    await store.load();
    const result = await store.write({ sensitivity: 'aggressive' });
    expect(result.errorCode).toBeNull();
    expect(result.config.sensitivity).toBe('aggressive');
  });

  it('写入后订阅者收到新配置，退订后不再收到', async () => {
    const store = new ConfigStore();
    const handler = vi.fn();
    const dispose = store.subscribe(handler);
    expect(handler).toHaveBeenCalledTimes(1);
    await store.write({ showPtcHint: false });
    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler.mock.calls[1]![0].showPtcHint).toBe(false);
    dispose();
    await store.write({ showPtcHint: true });
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('非法 sensitivity 写入返回 INVALID_SENSITIVITY', async () => {
    const store = new ConfigStore();
    await store.load();
    const result = await store.write({ sensitivity: 'invalid' as never });
    expect(result.errorCode).toBe(ERR_INVALID_SENSITIVITY);
  });
});

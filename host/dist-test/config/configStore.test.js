import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigStore, ERR_INVALID_SENSITIVITY, ERR_CFG_WRITE_FAILED } from './configStore';
import { DEFAULT_PLUGIN_CONFIG } from '../model/pluginConfig';
function makeMockCtx() {
    return {
        on: vi.fn(() => () => { }),
        effect: vi.fn(() => undefined),
        inject: ['agents', 'tools'],
        log: vi.fn(),
        config: {
            read: vi.fn(async () => null),
            write: vi.fn(async () => { }),
            subscribe: vi.fn(() => () => { }),
        },
        expose: vi.fn(),
        push: vi.fn(),
    };
}
describe('ConfigStore', () => {
    let ctx;
    beforeEach(() => {
        ctx = makeMockCtx();
    });
    it('非法 sensitivity 回退 standard 并告警', async () => {
        vi.mocked(ctx.config.read).mockResolvedValue({ enabled: true, sensitivity: 'invalid', showPtcHint: true });
        const store = new ConfigStore(ctx);
        await store.load();
        const config = store.read();
        expect(config.sensitivity).toBe('standard');
        expect(ctx.log).toHaveBeenCalledWith('warn', expect.stringContaining('invalid sensitivity'), expect.anything());
    });
    it('读取失败返回默认值', async () => {
        vi.mocked(ctx.config.read).mockRejectedValue(new Error('fail'));
        const store = new ConfigStore(ctx);
        const config = await store.load();
        expect(config).toEqual(DEFAULT_PLUGIN_CONFIG);
    });
    it('写入成功返回新值', async () => {
        const store = new ConfigStore(ctx);
        await store.load();
        const result = await store.write({ sensitivity: 'aggressive' });
        expect(result.errorCode).toBeNull();
        expect(result.config.sensitivity).toBe('aggressive');
    });
    it('写入失败返回上次值 + CFG_WRITE_FAILED', async () => {
        vi.mocked(ctx.config.write).mockRejectedValue(new Error('fail'));
        const store = new ConfigStore(ctx);
        await store.load();
        const result = await store.write({ sensitivity: 'loose' });
        expect(result.errorCode).toBe(ERR_CFG_WRITE_FAILED);
        expect(result.config.sensitivity).toBe('standard');
    });
    it('非法 sensitivity 写入返回 INVALID_SENSITIVITY', async () => {
        const store = new ConfigStore(ctx);
        await store.load();
        const result = await store.write({ sensitivity: 'invalid' });
        expect(result.errorCode).toBe(ERR_INVALID_SENSITIVITY);
    });
});

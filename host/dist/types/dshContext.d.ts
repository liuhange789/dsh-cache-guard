export type Disposer = () => void;
/** 工具注册定义：DSH 的 tools 服务在注册时校验 output.schema / output.render 形状。 */
export interface DshToolDefinition {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    output: {
        schema: Record<string, unknown>;
        render: (args: Record<string, unknown>, value: Record<string, unknown>) => Array<Record<string, unknown>>;
    };
    execute: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
}
export interface DshLogger {
    info(message: string): void;
    warn(message: string): void;
    debug?(message: string): void;
}
/**
 * 插件拿到的 Host Context —— 只声明本插件真正用到、且在 DSH 宿主里确实存在的成员。
 * 之前的 ctx.expose / ctx.push / ctx.config / ctx.inject 在 cordis 的 Context 上都不存在，
 * 照着它们写会在 apply 阶段直接抛 TypeError；这里改为 tools / on / effect / logger。
 */
export interface DshEventContext {
    tools?: {
        register(definition: DshToolDefinition): Disposer;
    };
    logger?: DshLogger;
    /** 老版本宿主用这个函数式日志接口。 */
    log?(level: 'info' | 'warn' | 'error', message: string, fields?: Record<string, unknown>): void;
    on(eventName: string, handler: (...args: unknown[]) => unknown): Disposer;
    effect<T>(fn: () => Disposer | Promise<Disposer>): T;
}
export type DshHostContext = DshEventContext;
export type LogFn = (level: 'debug' | 'info' | 'warn' | 'error', message: string, fields?: Record<string, unknown>) => void;
/** 统一日志适配：优先 cordis logger 服务，其次老宿主 ctx.log，最后退回 console。 */
export declare function createLog(ctx: DshHostContext): LogFn;
//# sourceMappingURL=dshContext.d.ts.map
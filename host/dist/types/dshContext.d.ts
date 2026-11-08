export type Disposer = () => void;
export interface DshEventContext {
    on(eventName: string, handler: (...args: unknown[]) => void): Disposer;
    effect<T>(fn: () => Disposer | Promise<Disposer>): T;
    inject: readonly string[];
    log(level: 'info' | 'warn' | 'error', message: string, fields?: Record<string, unknown>): void;
    config: {
        read(): Promise<Record<string, unknown> | null>;
        write(patch: Record<string, unknown>): Promise<void>;
        subscribe(handler: (config: Record<string, unknown>) => void): Disposer;
    };
    expose(name: string, handler: (...args: unknown[]) => unknown): void;
    push(event: string, payload: unknown): void;
}
export interface DshHostContext extends DshEventContext {
    inject: readonly string[];
}
export interface DshClientContext {
    host: {
        call(method: string, ...args: unknown[]): Promise<unknown>;
        subscribe(event: string, handler: (payload: unknown) => void): Disposer;
    };
    ui: {
        statusBar: {
            mount(element: HTMLElement): void;
            unmount(): void;
        };
        hintArea: {
            mount(element: HTMLElement): void;
            unmount(): void;
        };
        settings: {
            mount(element: HTMLElement): void;
            unmount(): void;
        };
    };
    log(level: 'info' | 'warn' | 'error', message: string, fields?: Record<string, unknown>): void;
}

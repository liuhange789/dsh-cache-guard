export type Disposer = () => void;

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
import type { Level } from '../model/types.ts';
export declare class StatusDot {
    private el;
    private lastLevel;
    private lastRenderAt;
    private readonly uiThrottleMs;
    mount(container: HTMLElement): void;
    render(level: Level): void;
    unmount(): void;
}

import type { HealthSignal } from '../model/types.ts';
export declare class HintLine {
    private el;
    private readonly onWarn?;
    constructor(onWarn?: (msg: string) => void);
    mount(container: HTMLElement): void;
    update(signal: HealthSignal): void;
    private setText;
    hide(): void;
    unmount(): void;
}

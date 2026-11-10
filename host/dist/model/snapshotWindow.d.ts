import type { SessionSnapshot } from './sessionSnapshot.ts';
export declare const MAX_WINDOW_BYTES: number;
export declare const MAX_WINDOW_ENTRIES = 256;
export declare class SnapshotWindow {
    private readonly snapshots;
    private totalBytesCache;
    push(snapshot: SessionSnapshot): void;
    latest(): SessionSnapshot | null;
    evict(): void;
    clear(): void;
    totalBytes(): number;
    size(): number;
    all(): readonly SessionSnapshot[];
}
//# sourceMappingURL=snapshotWindow.d.ts.map
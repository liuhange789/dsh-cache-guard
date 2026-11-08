import { byteSize } from './sessionSnapshot.ts';
export const MAX_WINDOW_BYTES = 512 * 1024;
export const MAX_WINDOW_ENTRIES = 256;
export class SnapshotWindow {
    snapshots = [];
    totalBytesCache = 0;
    push(snapshot) {
        const size = byteSize(snapshot);
        this.snapshots.push(snapshot);
        this.totalBytesCache += size;
        this.evict();
    }
    latest() {
        const len = this.snapshots.length;
        return len === 0 ? null : this.snapshots[len - 1];
    }
    evict() {
        while (this.snapshots.length > 0 &&
            (this.totalBytesCache > MAX_WINDOW_BYTES ||
                this.snapshots.length > MAX_WINDOW_ENTRIES)) {
            const oldest = this.snapshots.shift();
            if (oldest) {
                this.totalBytesCache -= byteSize(oldest);
            }
        }
    }
    clear() {
        this.snapshots.length = 0;
        this.totalBytesCache = 0;
    }
    totalBytes() {
        return this.totalBytesCache;
    }
    size() {
        return this.snapshots.length;
    }
    all() {
        return this.snapshots;
    }
}
//# sourceMappingURL=snapshotWindow.js.map
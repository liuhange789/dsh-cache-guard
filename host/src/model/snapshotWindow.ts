import type { SessionSnapshot } from './sessionSnapshot.ts';
import { byteSize } from './sessionSnapshot.ts';

export const MAX_WINDOW_BYTES = 512 * 1024;
export const MAX_WINDOW_ENTRIES = 256;

export class SnapshotWindow {
  private readonly snapshots: SessionSnapshot[] = [];
  private totalBytesCache = 0;

  push(snapshot: SessionSnapshot): void {
    const size = byteSize(snapshot);
    this.snapshots.push(snapshot);
    this.totalBytesCache += size;
    this.evict();
  }

  latest(): SessionSnapshot | null {
    const len = this.snapshots.length;
    return len === 0 ? null : this.snapshots[len - 1]!;
  }

  evict(): void {
    while (
      this.snapshots.length > 0 &&
      (this.totalBytesCache > MAX_WINDOW_BYTES ||
        this.snapshots.length > MAX_WINDOW_ENTRIES)
    ) {
      const oldest = this.snapshots.shift();
      if (oldest) {
        this.totalBytesCache -= byteSize(oldest);
      }
    }
  }

  clear(): void {
    this.snapshots.length = 0;
    this.totalBytesCache = 0;
  }

  totalBytes(): number {
    return this.totalBytesCache;
  }

  size(): number {
    return this.snapshots.length;
  }

  all(): readonly SessionSnapshot[] {
    return this.snapshots;
  }
}
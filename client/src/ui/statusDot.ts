import type { Level } from '../model/types.ts';

const COLORS: Record<Level, string> = {
  green: '#52C41A',
  yellow: '#FAAD14',
  red: '#FF4D4F',
  none: 'transparent',
};

const DOT_SIZE = 8;

export class StatusDot {
  private el: HTMLElement | null = null;
  private lastLevel: Level | null = null;
  private lastRenderAt = 0;
  private readonly uiThrottleMs = 1000;

  mount(container: HTMLElement): void {
    const dot = document.createElement('div');
    dot.style.width = `${DOT_SIZE}px`;
    dot.style.height = `${DOT_SIZE}px`;
    dot.style.borderRadius = '50%';
    dot.style.display = 'none';
    dot.style.marginLeft = '8px';
    dot.style.flexShrink = '0';
    container.appendChild(dot);
    this.el = dot;
  }

  render(level: Level): void {
    if (!this.el) return;
    const now = Date.now();
    if (level === this.lastLevel && now - this.lastRenderAt < this.uiThrottleMs) {
      return;
    }
    this.lastLevel = level;
    this.lastRenderAt = now;

    if (level === 'none') {
      this.el.style.display = 'none';
      return;
    }
    this.el.style.display = 'inline-block';
    this.el.style.backgroundColor = COLORS[level];
  }

  unmount(): void {
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
    this.el = null;
    this.lastLevel = null;
  }
}
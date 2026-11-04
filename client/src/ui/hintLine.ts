import type { HealthSignal, TriggerReason } from '../model/types.ts';
import { getYellowHint, getPtcHint, truncateHint, MAX_HINT_LENGTH } from '../hintTemplates.ts';

export class HintLine {
  private el: HTMLElement | null = null;
  private readonly onWarn?: (msg: string) => void;

  constructor(onWarn?: (msg: string) => void) {
    this.onWarn = onWarn;
  }

  mount(container: HTMLElement): void {
    const el = document.createElement('div');
    el.style.fontSize = '12px';
    el.style.color = '#FAAD14';
    el.style.background = 'transparent';
    el.style.whiteSpace = 'nowrap';
    el.style.overflow = 'hidden';
    el.style.textOverflow = 'ellipsis';
    el.style.display = 'none';
    el.style.marginBottom = '4px';
    container.appendChild(el);
    this.el = el;
  }

  update(signal: HealthSignal): void {
    if (!this.el) return;

    if (signal.ptcHintActive) {
      this.setText(getPtcHint());
      return;
    }

    if (signal.level === 'yellow' && signal.triggerReason) {
      const hint = getYellowHint(signal.triggerReason as TriggerReason);
      this.setText(hint);
      return;
    }

    this.hide();
  }

  private setText(text: string): void {
    if (!this.el) return;
    let final = text;
    if (text.length > MAX_HINT_LENGTH) {
      final = truncateHint(text);
      this.onWarn?.(`hint truncated: ${text.length} > ${MAX_HINT_LENGTH}`);
    }
    this.el.textContent = final;
    this.el.style.display = 'block';
  }

  hide(): void {
    if (this.el) {
      this.el.style.display = 'none';
      this.el.textContent = '';
    }
  }

  unmount(): void {
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
    this.el = null;
  }
}
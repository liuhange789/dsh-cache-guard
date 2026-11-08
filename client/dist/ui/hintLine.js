import { getYellowHint, getPtcHint, truncateHint, MAX_HINT_LENGTH } from '../hintTemplates.ts';
export class HintLine {
    el = null;
    onWarn;
    constructor(onWarn) {
        this.onWarn = onWarn;
    }
    mount(container) {
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
    update(signal) {
        if (!this.el)
            return;
        if (signal.ptcHintActive) {
            this.setText(getPtcHint());
            return;
        }
        if (signal.level === 'yellow' && signal.triggerReason) {
            const hint = getYellowHint(signal.triggerReason);
            this.setText(hint);
            return;
        }
        this.hide();
    }
    setText(text) {
        if (!this.el)
            return;
        let final = text;
        if (text.length > MAX_HINT_LENGTH) {
            final = truncateHint(text);
            this.onWarn?.(`hint truncated: ${text.length} > ${MAX_HINT_LENGTH}`);
        }
        this.el.textContent = final;
        this.el.style.display = 'block';
    }
    hide() {
        if (this.el) {
            this.el.style.display = 'none';
            this.el.textContent = '';
        }
    }
    unmount() {
        if (this.el && this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }
        this.el = null;
    }
}
//# sourceMappingURL=hintLine.js.map
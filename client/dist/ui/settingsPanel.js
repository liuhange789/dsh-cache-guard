const STYLE_FONT = 'PingFang SC, Microsoft YaHei, sans-serif';
const COLOR_PRIMARY = '#1677FF';
const RADIUS_CARD = '8px';
export class SettingsPanel {
    el = null;
    currentConfig = null;
    onWrite;
    constructor(onWrite) {
        this.onWrite = onWrite;
    }
    mount(container) {
        const panel = document.createElement('div');
        panel.style.fontFamily = STYLE_FONT;
        panel.style.padding = '16px';
        panel.style.borderRadius = RADIUS_CARD;
        panel.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
        panel.style.background = '#fff';
        container.appendChild(panel);
        this.el = panel;
    }
    render(config) {
        if (!this.el)
            return;
        this.currentConfig = config;
        const el = this.el;
        el.innerHTML = '';
        el.appendChild(this.createToggleRow('启用', config.enabled, async (v) => {
            await this.write({ enabled: v });
        }));
        el.appendChild(this.createSpacer(12));
        el.appendChild(this.createRadioRow('灵敏度', config.sensitivity, async (v) => {
            await this.write({ sensitivity: v });
        }));
        el.appendChild(this.createSpacer(12));
        el.appendChild(this.createToggleRow('PTC 提示', config.showPtcHint, async (v) => {
            await this.write({ showPtcHint: v });
        }));
    }
    createToggleRow(label, checked, onChange) {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        const labelEl = document.createElement('span');
        labelEl.textContent = label;
        labelEl.style.fontSize = '14px';
        row.appendChild(labelEl);
        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.checked = checked;
        toggle.style.accentColor = COLOR_PRIMARY;
        toggle.style.cursor = 'pointer';
        toggle.addEventListener('change', () => {
            onChange(toggle.checked);
        });
        row.appendChild(toggle);
        return row;
    }
    createRadioRow(label, value, onChange) {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        const labelEl = document.createElement('span');
        labelEl.textContent = label;
        labelEl.style.fontSize = '14px';
        row.appendChild(labelEl);
        const group = document.createElement('div');
        group.style.display = 'flex';
        group.style.gap = '8px';
        const options = [
            { value: 'loose', label: '宽松' },
            { value: 'standard', label: '标准' },
            { value: 'aggressive', label: '激进' },
        ];
        for (const opt of options) {
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = `sensitivity-${label}`;
            radio.checked = opt.value === value;
            radio.style.accentColor = COLOR_PRIMARY;
            radio.style.cursor = 'pointer';
            radio.addEventListener('change', () => {
                if (radio.checked)
                    onChange(opt.value);
            });
            const radioLabel = document.createElement('label');
            radioLabel.style.fontSize = '13px';
            radioLabel.style.cursor = 'pointer';
            radioLabel.style.marginRight = '4px';
            radioLabel.appendChild(radio);
            radioLabel.appendChild(document.createTextNode(opt.label));
            group.appendChild(radioLabel);
        }
        row.appendChild(group);
        return row;
    }
    createSpacer(height) {
        const spacer = document.createElement('div');
        spacer.style.height = `${height}px`;
        return spacer;
    }
    async write(patch) {
        if (!this.currentConfig)
            return;
        const result = await this.onWrite(patch);
        if (result.errorCode) {
            this.render(this.currentConfig);
            this.showInlineError('写入失败，已回滚');
        }
        else {
            this.render(result.config);
        }
    }
    showInlineError(msg) {
        if (!this.el)
            return;
        const err = document.createElement('div');
        err.textContent = msg;
        err.style.color = '#FF4D4F';
        err.style.fontSize = '12px';
        err.style.marginTop = '8px';
        this.el.appendChild(err);
        setTimeout(() => {
            if (err.parentNode)
                err.parentNode.removeChild(err);
        }, 3000);
    }
    unmount() {
        if (this.el && this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }
        this.el = null;
    }
}
//# sourceMappingURL=settingsPanel.js.map
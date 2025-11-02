const DPRMonitor = {
    badge: null,
    valueEl: null,
    messageEl: null,
    
    stateConfig: {
        1: { class: 'success', message: CONFIG.messages.dpr.perfect },
        high: { class: 'warning', message: CONFIG.messages.dpr.zoomOut },
        low: { class: 'warning', message: CONFIG.messages.dpr.zoomIn }
    },

    init() {
        this.badge = document.getElementById('dprBadge');
        this.valueEl = document.getElementById('dprValue');
        this.messageEl = document.getElementById('dprMessage');
        
        this.update();
        setInterval(() => this.update(), 500);
    },

    getState(dpr) {
        if (dpr === 1) return this.stateConfig[1];
        if (dpr > 1) return this.stateConfig.high;
        return this.stateConfig.low;
    },

    update() {
        const dpr = window.devicePixelRatio;
        const state = this.getState(dpr);
        
        this.valueEl.textContent = dpr.toFixed(2);
        this.badge.className = `dpr-badge ${state.class}`;
        this.messageEl.textContent = state.message;
    }
};

DPRMonitor.init();
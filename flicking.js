const Flicking = {
    canvas: null,
    ctx: null,
    target: { x: 0, y: 0, radius: CONFIG.flicking.targetRadius, spawnTime: 0 },
    stats: { hits: 0, misses: 0, times: [] },

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        
        this.spawnTarget();
    },

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.draw();
    },

    spawnTarget() {
        const padding = this.target.radius + CONFIG.flicking.targetPadding;
        this.target.x = padding + Math.random() * (this.canvas.width - padding * 2);
        this.target.y = padding + Math.random() * (this.canvas.height - padding * 2);
        this.target.spawnTime = Date.now();
        this.draw();
    },

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.beginPath();
        this.ctx.arc(this.target.x, this.target.y, this.target.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(this.target.x, this.target.y, 5, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();
    },

    isHit(x, y) {
        const distance = Math.sqrt((x - this.target.x) ** 2 + (y - this.target.y) ** 2);
        return distance <= this.target.radius;
    },

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const hit = this.isHit(x, y);
        
        if (hit) {
            const time = Date.now() - this.target.spawnTime;
            this.stats.hits++;
            this.stats.times.push(time);
            this.spawnTarget();
            this.updateStats();
            return;
        }
        
        this.stats.misses++;
        this.updateStats();
    },

    calculateAccuracy() {
        const total = this.stats.hits + this.stats.misses;
        if (total === 0) return 0;
        return (this.stats.hits / total * 100).toFixed(1);
    },

    calculateAvgTime() {
        if (this.stats.times.length === 0) return 0;
        const sum = this.stats.times.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.stats.times.length);
    },

    updateStats() {
        document.getElementById('hits').textContent = this.stats.hits;
        document.getElementById('accuracy').textContent = `${this.calculateAccuracy()}%`;
        document.getElementById('avgTime').textContent = `${this.calculateAvgTime()}ms`;
    },

    reset() {
        this.stats = { hits: 0, misses: 0, times: [] };
        this.updateStats();
        this.spawnTarget();
    }
};

Flicking.init();
const Clicking = {
    canvas: null,
    ctx: null,
    targets: [],
    stats: { hits: 0, misses: 0, startTime: Date.now() },
    animationFrame: null,

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        
        this.spawnTargets();
        this.startAnimation();
    },

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    },

    spawnTargets() {
        this.targets = [];
        const padding = CONFIG.clicking.targetRadius + 40;
        const count = CONFIG.clicking.targetCount;

        for (let i = 0; i < count; i++) {
            this.targets.push({
                x: padding + Math.random() * (this.canvas.width - padding * 2),
                y: padding + Math.random() * (this.canvas.height - padding * 2),
                radius: CONFIG.clicking.targetRadius
            });
        }
    },

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.targets.forEach(target => {
            this.ctx.beginPath();
            this.ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ef4444';
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(target.x, target.y, 5, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fill();
        });
    },

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        let hit = false;
        this.targets = this.targets.filter(target => {
            const distance = Math.sqrt((x - target.x) ** 2 + (y - target.y) ** 2);
            if (distance <= target.radius) {
                hit = true;
                this.stats.hits++;
                return false;
            }
            return true;
        });

        if (!hit) {
            this.stats.misses++;
        }

        if (this.targets.length === 0) {
            this.spawnTargets();
        }

        this.updateStats();
    },

    updateStats() {
        const elapsed = (Date.now() - this.stats.startTime) / 1000;
        document.getElementById('hits').textContent = this.stats.hits;
        document.getElementById('time').textContent = `${elapsed.toFixed(1)}s`;
        
        const total = this.stats.hits + this.stats.misses;
        const accuracy = total > 0 ? (this.stats.hits / total * 100).toFixed(1) : 0;
        document.getElementById('accuracy').textContent = `${accuracy}%`;
    },

    startAnimation() {
        const animate = () => {
            this.draw();
            this.updateStats();
            this.animationFrame = requestAnimationFrame(animate);
        };
        animate();
    },

    reset() {
        this.stats = { hits: 0, misses: 0, startTime: Date.now() };
        this.spawnTargets();
        this.updateStats();
    }
};

Clicking.init();
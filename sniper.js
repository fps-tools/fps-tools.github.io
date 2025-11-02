const Sniper = {
    canvas: null,
    ctx: null,
    scope: null,
    target: { 
        x: 0, 
        y: 0, 
        width: CONFIG.sniper.targetWidth, 
        height: CONFIG.sniper.targetHeight,
        vx: 0,
        vy: 0,
        speed: 2
    },
    stats: { headshots: 0, bodyshots: 0, misses: 0 },
    directionChange: {
        min: 1,
        max: 3,
        nextChange: 0
    },
    animationFrame: null,
    lastFrame: Date.now(),

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scope = document.getElementById('sniperScope');
        this.gameWrapper = document.getElementById('gameWrapper');
        
        this.resizeCanvas();
        this.updateScopeSize();
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.updateScopeSize();
        });
        
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mouseleave', () => {
            this.scope.style.display = 'none';
        });
        this.canvas.addEventListener('mouseenter', () => {
            this.scope.style.display = 'block';
        });
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        
        this.setupControls();
        this.spawnTarget();
        this.scheduleDirectionChange();
        this.startAnimation();
    },

    setupControls() {
        const widthSlider = document.getElementById('widthSlider');
        const heightSlider = document.getElementById('heightSlider');
        const speedSlider = document.getElementById('speedSlider');
        const dirMinSlider = document.getElementById('dirMinSlider');
        const dirMaxSlider = document.getElementById('dirMaxSlider');

        widthSlider.addEventListener('input', (e) => {
            this.target.width = parseInt(e.target.value);
            document.getElementById('widthValue').textContent = e.target.value;
        });

        heightSlider.addEventListener('input', (e) => {
            this.target.height = parseInt(e.target.value);
            document.getElementById('heightValue').textContent = e.target.value;
        });

        speedSlider.addEventListener('input', (e) => {
            this.target.speed = parseFloat(e.target.value);
            document.getElementById('speedValue').textContent = e.target.value;
            // Update velocity with new speed while maintaining direction
            const angle = Math.atan2(this.target.vy, this.target.vx);
            this.target.vx = Math.cos(angle) * this.target.speed;
            this.target.vy = Math.sin(angle) * this.target.speed;
        });

        dirMinSlider.addEventListener('input', (e) => {
            this.directionChange.min = parseFloat(e.target.value);
            document.getElementById('dirMinValue').textContent = e.target.value;
            // Ensure min doesn't exceed max
            if (this.directionChange.min > this.directionChange.max) {
                this.directionChange.max = this.directionChange.min;
                dirMaxSlider.value = this.directionChange.min;
                document.getElementById('dirMaxValue').textContent = this.directionChange.min;
            }
        });

        dirMaxSlider.addEventListener('input', (e) => {
            this.directionChange.max = parseFloat(e.target.value);
            document.getElementById('dirMaxValue').textContent = e.target.value;
            // Ensure max doesn't go below min
            if (this.directionChange.max < this.directionChange.min) {
                this.directionChange.min = this.directionChange.max;
                dirMinSlider.value = this.directionChange.max;
                document.getElementById('dirMinValue').textContent = this.directionChange.max;
            }
        });
    },

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    },

    updateScopeSize() {
        const rect = this.gameWrapper.getBoundingClientRect();
        this.scope.style.width = `${rect.width}px`;
        this.scope.style.height = `${rect.height}px`;
        this.scope.style.left = `${rect.left}px`;
        this.scope.style.top = `${rect.top}px`;
    },

    spawnTarget() {
        const padding = Math.max(this.target.width, this.target.height) / 2 + 40;
        this.target.x = padding + Math.random() * (this.canvas.width - padding * 2);
        this.target.y = padding + Math.random() * (this.canvas.height - padding * 2);
        this.changeDirection();
    },

    changeDirection() {
        const angle = Math.random() * Math.PI * 2;
        this.target.vx = Math.cos(angle) * this.target.speed;
        this.target.vy = Math.sin(angle) * this.target.speed;
    },

    scheduleDirectionChange() {
        const delay = (this.directionChange.min + Math.random() * (this.directionChange.max - this.directionChange.min)) * 1000;
        this.directionChange.nextChange = Date.now() + delay;
    },

    update() {
        const now = Date.now();
        const deltaTime = (now - this.lastFrame) / 1000;
        this.lastFrame = now;

        if (now >= this.directionChange.nextChange) {
            this.changeDirection();
            this.scheduleDirectionChange();
        }

        this.target.x += this.target.vx;
        this.target.y += this.target.vy;

        const halfWidth = this.target.width / 2;
        const halfHeight = this.target.height / 2;

        if (this.target.x - halfWidth < 0 || this.target.x + halfWidth > this.canvas.width) {
            this.target.vx *= -1;
            this.target.x = Math.max(halfWidth, Math.min(this.canvas.width - halfWidth, this.target.x));
        }

        if (this.target.y - halfHeight < 0 || this.target.y + halfHeight > this.canvas.height) {
            this.target.vy *= -1;
            this.target.y = Math.max(halfHeight, Math.min(this.canvas.height - halfHeight, this.target.y));
        }
    },

    drawCapsule(x, y, width, height) {
        const radius = width / 2;
        const bodyHeight = height - width;

        this.ctx.beginPath();
        this.ctx.arc(x, y - bodyHeight / 2, radius, Math.PI, 0, false);
        this.ctx.arc(x, y + bodyHeight / 2, radius, 0, Math.PI, false);
        this.ctx.closePath();
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fill();
        
        const headHeight = height / 3;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x - radius, y - bodyHeight / 2 - radius + headHeight);
        this.ctx.lineTo(x + radius, y - bodyHeight / 2 - radius + headHeight);
        this.ctx.stroke();
    },

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCapsule(this.target.x, this.target.y, this.target.width, this.target.height);
    },

    startAnimation() {
        const animate = () => {
            this.update();
            this.draw();
            this.animationFrame = requestAnimationFrame(animate);
        };
        animate();
    },

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.scope.style.display = 'block';
        
        const scopeCutout = this.scope.querySelector('.scope-cutout');
        scopeCutout.style.left = `${x}px`;
        scopeCutout.style.top = `${y}px`;
    },

    isHeadshot(x, y) {
        const dx = x - this.target.x;
        const dy = y - this.target.y;
        const radius = this.target.width / 2;
        const bodyHeight = this.target.height - this.target.width;
        const headHeight = this.target.height / 3;
        const headTop = -bodyHeight / 2 - radius;
        const headBottom = headTop + headHeight;

        if (dy < headTop || dy > headBottom) return false;

        if (dy >= headTop && dy <= headBottom - radius) {
            return Math.abs(dx) <= radius;
        }

        const circleY = headBottom - radius;
        const distance = Math.sqrt(dx ** 2 + (dy - circleY) ** 2);
        return distance <= radius;
    },

    isBodyshot(x, y) {
        const dx = x - this.target.x;
        const dy = y - this.target.y;
        const radius = this.target.width / 2;
        const bodyHeight = this.target.height - this.target.width;

        if (Math.abs(dy) <= bodyHeight / 2) {
            return Math.abs(dx) <= radius;
        }

        const circleY = dy > 0 ? bodyHeight / 2 : -bodyHeight / 2;
        const distance = Math.sqrt(dx ** 2 + (dy - circleY) ** 2);
        return distance <= radius;
    },

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.isHeadshot(x, y)) {
            this.stats.headshots++;
            this.spawnTarget();
            this.scheduleDirectionChange();
            this.updateStats();
            return;
        }

        if (this.isBodyshot(x, y)) {
            this.stats.bodyshots++;
            this.spawnTarget();
            this.scheduleDirectionChange();
            this.updateStats();
            return;
        }

        this.stats.misses++;
        this.updateStats();
    },

    updateStats() {
        document.getElementById('headshots').textContent = this.stats.headshots;
        document.getElementById('bodyshots').textContent = this.stats.bodyshots;
        
        const total = this.stats.headshots + this.stats.bodyshots;
        const hsPercent = total > 0 ? (this.stats.headshots / total * 100).toFixed(1) : 0;
        document.getElementById('hsPercent').textContent = `${hsPercent}%`;
    },

    reset() {
        this.stats = { headshots: 0, bodyshots: 0, misses: 0 };
        this.updateStats();
        this.spawnTarget();
        this.scheduleDirectionChange();
    }
};

Sniper.init();
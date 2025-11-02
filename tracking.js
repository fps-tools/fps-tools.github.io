const Tracking = {
    canvas: null,
    ctx: null,
    target: {
        x: 0,
        y: 0,
        width: CONFIG.tracking.default.width,
        height: CONFIG.tracking.default.height,
        vx: 0,
        vy: 0,
        speed: CONFIG.tracking.default.speed
    },
    stats: {
        timeInside: 0,
        totalTime: 0,
        startTime: Date.now(),
        lastFrame: Date.now()
    },
    directionChange: {
        min: CONFIG.tracking.default.directionChangeMin,
        max: CONFIG.tracking.default.directionChangeMax,
        nextChange: 0
    },
    mouseInside: false,
    animationFrame: null,

    init() {
        this.canvas = document.getElementById('trackingCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => this.mouseInside = false);
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
            this.target.width = parseFloat(e.target.value);
            document.getElementById('widthValue').textContent = e.target.value;
        });

        heightSlider.addEventListener('input', (e) => {
            this.target.height = parseFloat(e.target.value);
            document.getElementById('heightValue').textContent = e.target.value;
        });

        speedSlider.addEventListener('input', (e) => {
            this.target.speed = parseFloat(e.target.value);
            document.getElementById('speedValue').textContent = e.target.value;
        });

        dirMinSlider.addEventListener('input', (e) => {
            this.directionChange.min = parseFloat(e.target.value);
            document.getElementById('dirMinValue').textContent = e.target.value;
        });

        dirMaxSlider.addEventListener('input', (e) => {
            this.directionChange.max = parseFloat(e.target.value);
            document.getElementById('dirMaxValue').textContent = e.target.value;
        });
    },

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    },

    spawnTarget() {
        const padding = Math.max(this.target.width, this.target.height) / 2 + 20;
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
        const deltaTime = (now - this.stats.lastFrame) / 1000;
        this.stats.lastFrame = now;
        this.stats.totalTime = (now - this.stats.startTime) / 1000;

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

        if (this.mouseInside) {
            this.stats.timeInside += deltaTime;
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
    },

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCapsule(this.target.x, this.target.y, this.target.width, this.target.height);
    },

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.mouseInside = this.isInsideCapsule(x, y);
    },

    isInsideCapsule(x, y) {
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

    updateStats() {
        document.getElementById('timeInside').textContent = this.stats.timeInside.toFixed(1) + 's';
        document.getElementById('totalTime').textContent = this.stats.totalTime.toFixed(1) + 's';
        
        const accuracy = this.stats.totalTime > 0 ? (this.stats.timeInside / this.stats.totalTime * 100).toFixed(1) : 0;
        document.getElementById('accuracy').textContent = `${accuracy}%`;
    },

    startAnimation() {
        const animate = () => {
            this.update();
            this.draw();
            this.updateStats();
            this.animationFrame = requestAnimationFrame(animate);
        };
        animate();
    },

    reset() {
        this.stats = {
            timeInside: 0,
            totalTime: 0,
            startTime: Date.now(),
            lastFrame: Date.now()
        };
        this.mouseInside = false;
        this.spawnTarget();
        this.scheduleDirectionChange();
    }
};

Tracking.init();
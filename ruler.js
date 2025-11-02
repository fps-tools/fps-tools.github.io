const Ruler = {
    container: null,
    interval: CONFIG.ruler.interval,

    init() {
        this.container = document.getElementById('rulerContainer');
        this.generate();
        window.addEventListener('resize', () => this.generate());
        RulerSliders.init(this.container);
    },

    generate() {
        this.container.innerHTML = '';
        const width = window.innerWidth;

        for (let i = 0; i <= width; i += this.interval) {
            this.container.appendChild(this.createMark(i));
        }

        requestAnimationFrame(() => this.adjustOverflow(width));
        RulerSliders.render();
    },

    createMark(position) {
        const mark = document.createElement('div');
        mark.className = 'ruler-mark';
        mark.style.left = `${position}px`;

        const number = document.createElement('div');
        number.className = 'ruler-number';
        number.textContent = position;

        const line = document.createElement('div');
        line.className = 'ruler-line';

        mark.appendChild(number);
        mark.appendChild(line);

        return mark;
    },

    calculateOffset(rect, width) {
        if (rect.left < 0) return -rect.left;
        if (rect.right > width) return -(rect.right - width);
        return 0;
    },

    adjustOverflow(width) {
        const marks = this.container.querySelectorAll('.ruler-mark');
        
        marks.forEach(mark => {
            const number = mark.querySelector('.ruler-number');
            const rect = number.getBoundingClientRect();
            const offset = this.calculateOffset(rect, width);

            if (offset === 0) return;
            
            number.style.position = 'relative';
            number.style.left = `${offset}px`;
        });
    }
};

const RulerSliders = {
    container: null,
    leftSlider: null,
    rightSlider: null,
    dragging: null,

    init(container) {
        this.container = container;
        this.createSliders();
        this.attachEvents();
    },

    createSlider(side) {
        const slider = document.createElement('div');
        slider.className = 'ruler-slider';
        slider.dataset.side = side;

        const handle = document.createElement('div');
        handle.className = 'slider-handle';

        const distance = document.createElement('div');
        distance.className = 'slider-distance';
        distance.textContent = '0px';

        slider.appendChild(handle);
        slider.appendChild(distance);

        return slider;
    },

    createSliders() {
        this.leftSlider = this.createSlider('left');
        this.rightSlider = this.createSlider('right');
        this.leftSlider.style.left = '0px';
        this.leftSlider.dataset.origin = '0';
    },

    render() {
        if (!this.leftSlider.parentElement) {
            this.container.appendChild(this.leftSlider);
        }
        
        if (!this.rightSlider.parentElement) {
            this.container.appendChild(this.rightSlider);
        }

        const width = this.container.offsetWidth;
        this.rightSlider.style.left = `${width}px`;
        this.rightSlider.dataset.origin = width;
    },

    attachEvents() {
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', () => this.handleMouseUp());
    },

    handleMouseDown(e) {
        const slider = e.target.closest('.ruler-slider');
        if (!slider) return;

        this.dragging = slider;
        slider.classList.add('dragging');
        e.preventDefault();
    },

    handleMouseMove(e) {
        if (!this.dragging) return;

        const rect = this.container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const side = this.dragging.dataset.side;
        const origin = parseFloat(this.dragging.dataset.origin);

        const constrainedX = this.constrainPosition(x, side, origin);
        this.dragging.style.left = `${constrainedX}px`;

        const distance = Math.abs(constrainedX - origin);
        const distanceLabel = this.dragging.querySelector('.slider-distance');
        distanceLabel.textContent = `${Math.round(distance)}px`;
    },

    constrainPosition(x, side, origin) {
        const width = this.container.offsetWidth;
        
        if (side === 'left') {
            return Math.max(origin, Math.min(x, width));
        }
        
        return Math.max(0, Math.min(x, origin));
    },

    handleMouseUp() {
        if (!this.dragging) return;

        this.dragging.classList.remove('dragging');
        this.dragging = null;
    }
};

Ruler.init();
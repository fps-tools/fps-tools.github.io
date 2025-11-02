const CONFIG = {
    site: {
        name: 'Claude\'s FPS Tool Workshop',
        homepage: 'index.html'
    },
    
    nav: [
        { label: 'Ruler', href: 'ruler.html' },
        { label: 'Tracking', href: 'tracking.html' },
        { label: 'Flicking', href: 'flicking.html' },
        { label: 'Clicking', href: 'clicking.html' },
        { label: 'Sniper', href: 'sniper.html' },
        { label: 'GridShot', href: 'gridshot.html' },
        { label: 'Precision', href: 'precision.html' },
        { label: 'D-Day', href: 'dday.html' }
    ],
    
    messages: {
        dpr: {
            perfect: 'Perfect! Your pixel ratio is 1:1',
            zoomOut: 'Zoom out (Ctrl/Cmd -) to achieve 1:1 ratio',
            zoomIn: 'Zoom in (Ctrl/Cmd +) to achieve 1:1 ratio'
        }
    },
    
    tracking: {
        default: {
            width: 40,
            height: 120,
            speed: 2,
            directionChangeMin: 1,
            directionChangeMax: 3
        },
        dday: {
            width: 20,
            height: 60,
            speed: 20,
            directionChangeMin: 0.1,
            directionChangeMax: 0.3
        }
    },
    
    flicking: {
        targetRadius: 30,
        targetPadding: 40
    },
    
    clicking: {
        targetRadius: 35,
        targetCount: 6
    },
    
    sniper: {
        targetWidth: 50,
        targetHeight: 150,
        scopeSize: 400,
        crosshairWidth: 2
    },
    
    gridshot: {
        gridSize: 3,
        targetRadius: 40,
        spawnDelay: 200
    },
    
    precision: {
        targetRadius: 15,
        targetPadding: 30
    },
    
    ruler: {
        interval: 50
    }
};
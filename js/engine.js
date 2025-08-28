// --- MODULE: UTILITY FUNCTIONS ---

/**
 * Determines if two line segments intersect.
 */
function intersects(lineA, lineB) {
    const p1 = { x: lineA.x1, y: lineA.y1 };
    const q1 = { x: lineA.x2, y: lineA.y2 };
    const p2 = { x: lineB.x1, y: lineB.y1 };
    const q2 = { x: lineB.x2, y: lineB.y2 };

    const o1 = orientation(p1, q1, p2);
    const o2 = orientation(p1, q1, q2);
    const o3 = orientation(p2, q2, p1);
    const o4 = orientation(p2, q2, q1);

    if (o1 !== o2 && o3 !== o4) return true;
    if (o1 === 0 && onSegment(p1, p2, q1)) return true;
    if (o2 === 0 && onSegment(p1, q2, q1)) return true;
    if (o3 === 0 && onSegment(p2, p1, q2)) return true;
    if (o4 === 0 && onSegment(p2, q1, q2)) return true;
    return false;
}

/**
 * Finds the orientation of the ordered triplet (p, q, r).
 */
function orientation(p, q, r) {
    const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (val === 0) return 0;
    return (val > 0) ? 1 : 2;
}

/**
 * Checks if point q lies on segment pr.
 */
function onSegment(p, q, r) {
    return (
        q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
        q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)
    );
}

/**
 * Checks if a set of lines forms a bridge from left to right.
 */
function checkConnectivity(lines, canvasWidth) {
    if (lines.length === 0) return false;
    const leftStarters = [];
    const rightFinishers = new Set();
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.x1 === 0 || line.x2 === 0) leftStarters.push(i);
        if (line.x1 === canvasWidth || line.x2 === canvasWidth) rightFinishers.add(i);
    }
    if (leftStarters.length === 0 || rightFinishers.size === 0) return false;
    const adj = new Map();
    for (let i = 0; i < lines.length; i++) adj.set(i, []);
    for (let i = 0; i < lines.length; i++) {
        for (let j = i + 1; j < lines.length; j++) {
            if (intersects(lines[i], lines[j])) {
                adj.get(i).push(j);
                adj.get(j).push(i);
            }
        }
    }
    const queue = [...leftStarters];
    const visited = new Set(leftStarters);
    while (queue.length > 0) {
        const currentIndex = queue.shift();
        if (rightFinishers.has(currentIndex)) return true;
        const neighbors = adj.get(currentIndex);
        for (const neighborIndex of neighbors) {
            if (!visited.has(neighborIndex)) {
                visited.add(neighborIndex);
                queue.push(neighborIndex);
            }
        }
    }
    return false;
}

// --- MODULE: RENDERING ENGINE ---

/**
 * Initializes the canvas and returns its 2D rendering context.
 */
function setupCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas with id "${canvasId}" not found.`);
        return null;
    }
    const ctx = canvas.getContext('2d');
    return { canvas, ctx };
}

/**
 * Renders the entire simulation state on the canvas.
 */
function render(ctx, canvas, state) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (state && state.lines) {
        ctx.strokeStyle = 'black';
        state.lines.forEach(line => {
            ctx.beginPath();
            ctx.moveTo(line.x1, line.y1);
            ctx.lineTo(line.x2, line.y2);
            ctx.stroke();
        });
    }
}

// --- MODULE: SIMULATION ENGINE ---

class SimulationEngine {
    constructor(canvasDimensions, simulationParameters) {
        this.canvasDimensions = canvasDimensions;
        this.simulationParameters = simulationParameters;
        this.reset();
    }

    reset() {
        this.lines = [];
        this.isRunning = false;
        this.lineCount = 0;
        this.connectingPath = [];
    }

    _generateRandomLine() {
        const { minLength, maxLength, minAngle, maxAngle } = this.simulationParameters;
        const { width, height } = this.canvasDimensions;
        let line;
        let isLineInside = false;
        while (!isLineInside) {
            const angle = (Math.random() * (maxAngle - minAngle) + minAngle) * (Math.PI / 180);
            const length = Math.random() * (maxLength - minLength) + minLength;
            const x1 = Math.random() * width;
            const y1 = Math.random() * height;
            const x2 = x1 + length * Math.cos(angle);
            const y2 = y1 + length * Math.sin(angle);
            if (x1 >= 0 && x1 <= width && y1 >= 0 && y1 <= height &&
                x2 >= 0 && x2 <= width && y2 >= 0 && y2 <= height) {
                isLineInside = true;
                line = { x1, y1, x2, y2 };
            }
        }
        return line;
    }

    runStep() {
        if (!this.isRunning) return;
        const newLine = this._generateRandomLine();
        this.lines.push(newLine);
        this.lineCount++;
        if (checkConnectivity(this.lines, this.canvasDimensions.width)) {
            this.isRunning = false;
        }
    }
}

// --- MAIN APPLICATION CONTROLLER ---

document.addEventListener('DOMContentLoaded', () => {
    // --- Initial Setup ---
    const { canvas, ctx } = setupCanvas('simulation-canvas');
    if (!canvas) return; // Stop if canvas is not found

    const initialParams = {
        minLength: 10,
        maxLength: 50,
        minAngle: 0,
        maxAngle: 360
    };

    const engine = new SimulationEngine({ width: canvas.width, height: canvas.height }, initialParams);

    let simulationInterval = null; // To hold the interval ID for the main loop

    // --- DOM Element References ---
    const lineCountDisplay = document.getElementById('line-count');
    const resultMessageDisplay = document.getElementById('result-message');
    const startButton = document.getElementById('start-button');
    const pauseButton = document.getElementById('pause-button');
    const resetButton = document.getElementById('reset-button');
    // Parameter controls
    const minLengthInput = document.getElementById('min-length');
    const maxLengthInput = document.getElementById('max-length');
    const minAngleInput = document.getElementById('min-angle');
    const maxAngleInput = document.getElementById('max-angle');

    // --- Event Listeners & Control Logic ---
    function updateEngineParameters() {
        engine.simulationParameters.minLength = parseFloat(minLengthInput.value);
        engine.simulationParameters.maxLength = parseFloat(maxLengthInput.value);
        engine.simulationParameters.minAngle = parseFloat(minAngleInput.value);
        engine.simulationParameters.maxAngle = parseFloat(maxAngleInput.value);
    }

    function mainLoop() {
        if (!engine.isRunning) {
            clearInterval(simulationInterval);
            simulationInterval = null;
            return;
        }

        engine.runStep();
        render(ctx, canvas, engine);
        lineCountDisplay.textContent = engine.lineCount;

        if (!engine.isRunning) { // The engine might have been stopped by runStep
            clearInterval(simulationInterval);
            simulationInterval = null;
            resultMessageDisplay.textContent = `Bridge formed with ${engine.lineCount} lines!`;
        }
    }

    startButton.addEventListener('click', () => {
        if (simulationInterval) return; // Already running
        engine.isRunning = true;
        updateEngineParameters();
        resultMessageDisplay.textContent = 'In progress...';
        simulationInterval = setInterval(mainLoop, 16); // ~60 FPS
    });

    pauseButton.addEventListener('click', () => {
        engine.isRunning = false; // This will cause the loop to stop itself
        resultMessageDisplay.textContent = 'Paused.';
    });

    resetButton.addEventListener('click', () => {
        engine.isRunning = false;
        if (simulationInterval) {
            clearInterval(simulationInterval);
            simulationInterval = null;
        }
        engine.reset();
        render(ctx, canvas, engine);
        lineCountDisplay.textContent = '0';
        resultMessageDisplay.textContent = 'Not started';
    });

    // Initial render
    render(ctx, canvas, engine);
});

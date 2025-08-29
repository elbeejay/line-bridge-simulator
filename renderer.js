// Module 3: 🖼️ Rendering Engine (`renderer.js`)

/**
 * Initializes the canvas and returns its 2D rendering context.
 * @param {string} canvasId The ID of the canvas element.
 * @returns {{canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D}}
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
 * Draws a single line segment on the canvas.
 * @param {CanvasRenderingContext2D} ctx The canvas rendering context.
 * @param {{x1: number, y1: number, x2: number, y2: number}} line The line object.
 * @param {string} color The color of the line.
 */
function drawLine(ctx, line, color = 'black') {
    ctx.beginPath();
    ctx.moveTo(line.x1, line.y1);
    ctx.lineTo(line.x2, line.y2);
    ctx.strokeStyle = color;
    ctx.stroke();
}

/**
 * Draws the boundary of the bridge area.
 * @param {CanvasRenderingContext2D} ctx The canvas rendering context.
 * @param {object} bridgeArea The area to draw ({ x, y, width, height }).
 */
function drawBridgeArea(ctx, bridgeArea) {
    if (!bridgeArea) return;
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'; // Red, semi-transparent
    ctx.lineWidth = 2;
    ctx.strokeRect(bridgeArea.x, bridgeArea.y, bridgeArea.width, bridgeArea.height);
    // Reset line width for other drawing
    ctx.lineWidth = 1;
}

/**
 * Renders the entire simulation state.
 * @param {CanvasRenderingContext2D} ctx The canvas rendering context.
 * @param {HTMLCanvasElement} canvas The canvas element.
 * @param {object} state The simulation state, containing the lines.
 * @param {object} bridgeArea The area where the bridge is calculated.
 */
function render(ctx, canvas, state, bridgeArea) {
    // 1. Clear the canvas completely
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Draw the rectangular boundary/background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3. Draw the bridge area
    drawBridgeArea(ctx, bridgeArea);

    // 4. Loop through the lines and draw each one
    if (state && state.lines) {
        state.lines.forEach(line => {
            drawLine(ctx, line);
        });
    }
}

/**
 * (Stretch Goal) Highlights a specific path of lines in a different color.
 * @param {CanvasRenderingContext2D} ctx The canvas rendering context.
 * @param {Array<{x1: number, y1: number, x2: number, y2: number}>} path The array of lines forming the path.
 * @param {string} color The highlight color.
 */
function highlightPath(ctx, path, color = 'red') {
    path.forEach(line => {
        drawLine(ctx, line, color);
    });
}

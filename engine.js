// For Node.js testing, require dependencies. For browser, they are global.
let UnionFind, intersects;

if (typeof module !== 'undefined' && module.exports) {
    // In Node.js, require the dependencies from utils.js
    const utils = require('./utils.js');
    UnionFind = utils.UnionFind;
    intersects = utils.intersects;
}

// Module 1: 🧑‍💻 Simulation Engine (`engine.js`)

class SimulationEngine {
    /**
     * Initializes the simulation engine.
     * @param {object} canvasDimensions - The dimensions of the canvas ({ width, height }).
     * @param {object} simulationParameters - The parameters for line generation ({ minLength, maxLength, minAngle, maxAngle }).
     */
    constructor(canvasDimensions, simulationParameters) {
        this.canvasDimensions = canvasDimensions || { width: 800, height: 600 };
        this.simulationParameters = simulationParameters || {
            minLength: 10,
            maxLength: 50,
            minAngle: 0,
            maxAngle: 360,
            boundaryCondition: 'left-to-right',
        };

        // Define the inner "bridge area" with a margin.
        const margin = {
            x: this.canvasDimensions.width * 0.1,
            y: this.canvasDimensions.height * 0.1,
        };

        this.bridgeArea = {
            x: margin.x,
            y: margin.y,
            width: this.canvasDimensions.width - 2 * margin.x,
            height: this.canvasDimensions.height - 2 * margin.y,
        };

        this.reset();
    }

    /**
     * Resets the simulation to its initial state.
     */
    reset() {
        this.lines = [];
        this.isRunning = false;
        this.lineCount = 0;
        this.connectingPath = [];
        this.clusters = [];

        // --- New properties for incremental checking ---
        // The UnionFind data structure will keep track of connected sets of lines.
        this.unionFind = new UnionFind();
        // Sets to store the indices of lines touching the start and end boundaries.
        this.starterLines = new Set();
        this.finisherLines = new Set();
        // --- End of new properties ---
    }

    /**
     * Generates a single random line that is guaranteed to be within the canvas boundaries.
     * This is a private helper method for the simulation engine.
     * @returns {{x1: number, y1: number, x2: number, y2: number}} A line object.
     */
    _generateRandomLine() {
        const { minLength, maxLength, minAngle, maxAngle } = this.simulationParameters;
        const { width, height } = this.canvasDimensions;

        let line;
        let isLineInside = false;

        // This loop can be inefficient if the parameters make it hard to find a valid line.
        // For this project, we'll assume parameters that are reasonable.
        while (!isLineInside) {
            // 1. Pick a random angle and length
            const angleDegrees = Math.random() * (maxAngle - minAngle) + minAngle;
            const angleRadians = angleDegrees * (Math.PI / 180);
            const length = Math.random() * (maxLength - minLength) + minLength;

            // 2. Pick a random starting point (x1, y1)
            const x1 = Math.random() * width;
            const y1 = Math.random() * height;

            // 3. Calculate the end point (x2, y2) based on the angle and length
            const x2 = x1 + length * Math.cos(angleRadians);
            const y2 = y1 + length * Math.sin(angleRadians);

            // 4. Check if the *entire line* is within the canvas boundaries
            if (x1 >= 0 && x1 <= width && y1 >= 0 && y1 <= height &&
                x2 >= 0 && x2 <= width && y2 >= 0 && y2 <= height) {

                isLineInside = true;
                line = { x1, y1, x2, y2 };
            }
        }
        return line;
    }

    /**
     * Executes one step of the simulation using the optimized incremental approach.
     * It generates a new line, updates the connectivity data, and checks for a bridge.
     */
    runStep() {
        if (!this.isRunning) {
            return;
        }

        // 1. Generate a new line and add it to the state.
        const newLine = this._generateRandomLine();
        this.lines.push(newLine);
        const newLineIndex = this.lineCount;
        this.lineCount++;

        // 2. Add the new line as a new set in our Union-Find structure.
        this.unionFind.add();

        // 3. Check if the new line touches the start or finish boundaries.
        const { boundaryCondition } = this.simulationParameters;
        const { bridgeArea } = this;
        const tolerance = 1e-9;
        const leftBoundary = bridgeArea.x;
        const rightBoundary = bridgeArea.x + bridgeArea.width;
        const topBoundary = bridgeArea.y;
        const bottomBoundary = bridgeArea.y + bridgeArea.height;

        let touchesStart = false;
        let touchesFinish = false;

        switch (boundaryCondition) {
            case 'top-to-bottom':
                touchesStart = newLine.y1 <= topBoundary + tolerance || newLine.y2 <= topBoundary + tolerance;
                touchesFinish = newLine.y1 >= bottomBoundary - tolerance || newLine.y2 >= bottomBoundary - tolerance;
                break;
            case 'top-left-to-bottom-right':
                 const cornerTolerance = 15;
                 const topLeft = { x: leftBoundary, y: topBoundary };
                 const bottomRight = { x: rightBoundary, y: bottomBoundary };
                 const isNearPoint = (p, t, tol) => Math.sqrt((p.x - t.x)**2 + (p.y - t.y)**2) <= tol;
                 touchesStart = isNearPoint({x: newLine.x1, y: newLine.y1}, topLeft, cornerTolerance) || isNearPoint({x: newLine.x2, y: newLine.y2}, topLeft, cornerTolerance);
                 touchesFinish = isNearPoint({x: newLine.x1, y: newLine.y1}, bottomRight, cornerTolerance) || isNearPoint({x: newLine.x2, y: newLine.y2}, bottomRight, cornerTolerance);
                break;
            case 'left-to-right':
            default:
                touchesStart = newLine.x1 <= leftBoundary + tolerance || newLine.x2 <= leftBoundary + tolerance;
                touchesFinish = newLine.x1 >= rightBoundary - tolerance || newLine.x2 >= rightBoundary - tolerance;
                break;
        }

        if (touchesStart) this.starterLines.add(newLineIndex);
        if (touchesFinish) this.finisherLines.add(newLineIndex);

        // 4. Check for intersections with all *previous* lines.
        for (let i = 0; i < newLineIndex; i++) {
            if (intersects(this.lines[i], newLine)) {
                // If they intersect, merge their sets.
                this.unionFind.union(i, newLineIndex);
            }
        }

        // 5. Check if a bridge has been formed using the new efficient method.
        const bridgeFoundInfo = this._checkForBridgeOptimized();

        if (bridgeFoundInfo) {
            this.isRunning = false;
            console.log(`Bridge formed with ${this.lineCount} lines!`);
            // Reconstruct the path using the information from the check.
            this.connectingPath = this._reconstructPath(bridgeFoundInfo.startLine, bridgeFoundInfo.root);
        }

        // The old clustering logic can be updated to use the Union-Find structure as well,
        // making it much more efficient.
        this.clusters = this._findAllClustersOptimized();
    }

    /**
     * Checks for a bridge by seeing if any starter line shares a set with any finisher line.
     * @returns {object|null} - An object with info for path reconstruction if a bridge is found, otherwise null.
     * @private
     */
    _checkForBridgeOptimized() {
        const starterRoots = new Map(); // Map root to a starter line with that root
        for (const starter of this.starterLines) {
            const root = this.unionFind.find(starter);
            if (!starterRoots.has(root)) {
                starterRoots.set(root, starter);
            }
        }

        if (starterRoots.size === 0) {
            return null;
        }

        for (const finisher of this.finisherLines) {
            const finisherRoot = this.unionFind.find(finisher);
            if (starterRoots.has(finisherRoot)) {
                // Bridge found! Return info needed to reconstruct the path.
                return {
                    startLine: starterRoots.get(finisherRoot), // A starter from the connected set
                    root: finisherRoot // The root of the connected set
                };
            }
        }
        return null; // No bridge yet
    }

    /**
     * Reconstructs the connecting path once a bridge is detected.
     * It builds a graph for only the connected component and runs a BFS to find the path.
     * @param {number} startLineIndex - The index of a line in the path that touches the start boundary.
     * @param {number} root - The root of the connected component forming the bridge.
     * @returns {Array<object>} - An array of line objects representing the connecting path.
     * @private
     */
    _reconstructPath(startLineIndex, root) {
        // 1. Get all line indices in the connected component.
        const componentIndices = [];
        for (let i = 0; i < this.lines.length; i++) {
            if (this.unionFind.find(i) === root) {
                componentIndices.push(i);
            }
        }

        // 2. Build an adjacency list for only the lines in this component.
        const adj = new Map();
        componentIndices.forEach(i => adj.set(i, []));

        for (let i = 0; i < componentIndices.length; i++) {
            for (let j = i + 1; j < componentIndices.length; j++) {
                const line1Idx = componentIndices[i];
                const line2Idx = componentIndices[j];
                if (intersects(this.lines[line1Idx], this.lines[line2Idx])) {
                    adj.get(line1Idx).push(line2Idx);
                    adj.get(line2Idx).push(line1Idx);
                }
            }
        }

        // 3. Run BFS from the starting line to find the shortest path to any finisher line.
        const queue = [[startLineIndex]]; // A queue of paths
        const visited = new Set([startLineIndex]);

        while (queue.length > 0) {
            const path = queue.shift();
            const lastNode = path[path.length - 1];

            // If the last node in the path is a finisher, we found our bridge path.
            if (this.finisherLines.has(lastNode)) {
                return path.map(index => this.lines[index]); // Return the array of line objects
            }

            const neighbors = adj.get(lastNode) || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    const newPath = [...path, neighbor];
                    queue.push(newPath);
                }
            }
        }

        return []; // Should not be reached if a bridge was correctly detected.
    }

    /**
     * Finds all clusters of connected lines using the efficient Union-Find data structure.
     * @returns {Array<Array<number>>} - An array of clusters, where each cluster is an array of line indices.
     * @private
     */
    _findAllClustersOptimized() {
        const clusters = new Map(); // Map root to a list of indices in its cluster
        for (let i = 0; i < this.lines.length; i++) {
            const root = this.unionFind.find(i);
            if (!clusters.has(root)) {
                clusters.set(root, []);
            }
            clusters.get(root).push(i);
        }
        return Array.from(clusters.values());
    }
}

console.log("engine.js loaded with SimulationEngine class.");

// For Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SimulationEngine };
}

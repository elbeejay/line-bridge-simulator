(function(global) {
    // --- Dependency Loading ---
    // This pattern allows the module to work in both Node.js and the browser.
    let UnionFind, intersects;

    if (typeof module !== 'undefined' && module.exports) {
        // We are in a Node.js environment, so we load dependencies with require.
        const utils = require('./utils.js');
        UnionFind = utils.UnionFind;
        intersects = utils.intersects;
    } else {
        // We are in a browser environment, so we'll use the global variables.
        UnionFind = global.UnionFind;
        intersects = global.intersects;
    }

    // --- Module Definition ---
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
            this.unionFind = new UnionFind();
            this.starterLines = new Set();
            this.finisherLines = new Set();
        }

        /**
         * Generates a single random line that is guaranteed to be within the canvas boundaries.
         * @returns {{x1: number, y1: number, x2: number, y2: number}} A line object.
         */
        _generateRandomLine() {
            const { minLength, maxLength, minAngle, maxAngle } = this.simulationParameters;
            const { width, height } = this.canvasDimensions;
            let line, isLineInside = false;

            while (!isLineInside) {
                const angleDegrees = Math.random() * (maxAngle - minAngle) + minAngle;
                const angleRadians = angleDegrees * (Math.PI / 180);
                const length = Math.random() * (maxLength - minLength) + minLength;
                const x1 = Math.random() * width;
                const y1 = Math.random() * height;
                const x2 = x1 + length * Math.cos(angleRadians);
                const y2 = y1 + length * Math.sin(angleRadians);

                if (x1 >= 0 && x1 <= width && y1 >= 0 && y1 <= height &&
                    x2 >= 0 && x2 <= width && y2 >= 0 && y2 <= height) {
                    isLineInside = true;
                    line = { x1, y1, x2, y2 };
                }
            }
            return line;
        }

        /**
         * Executes one step of the simulation.
         */
        runStep() {
            if (!this.isRunning) return;

            const newLine = this._generateRandomLine();
            this.lines.push(newLine);
            const newLineIndex = this.lineCount++;
            this.unionFind.add();

            const { boundaryCondition } = this.simulationParameters;
            const { bridgeArea } = this;
            const tolerance = 1e-9;
            const leftBoundary = bridgeArea.x;
            const rightBoundary = bridgeArea.x + bridgeArea.width;
            const topBoundary = bridgeArea.y;
            const bottomBoundary = bridgeArea.y + bridgeArea.height;

            let touchesStart = false, touchesFinish = false;
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

            for (let i = 0; i < newLineIndex; i++) {
                if (intersects(this.lines[i], newLine)) {
                    this.unionFind.union(i, newLineIndex);
                }
            }

            const bridgeFoundInfo = this._checkForBridgeOptimized();
            if (bridgeFoundInfo) {
                this.isRunning = false;
                this.connectingPath = this._reconstructPath(bridgeFoundInfo.startLine, bridgeFoundInfo.root);
            }
            this.clusters = this._findAllClustersOptimized();
        }

        _checkForBridgeOptimized() {
            const starterRoots = new Map();
            for (const starter of this.starterLines) {
                const root = this.unionFind.find(starter);
                if (!starterRoots.has(root)) starterRoots.set(root, starter);
            }
            if (starterRoots.size === 0) return null;
            for (const finisher of this.finisherLines) {
                const finisherRoot = this.unionFind.find(finisher);
                if (starterRoots.has(finisherRoot)) {
                    return { startLine: starterRoots.get(finisherRoot), root: finisherRoot };
                }
            }
            return null;
        }

        _reconstructPath(startLineIndex, root) {
            const componentIndices = [];
            for (let i = 0; i < this.lines.length; i++) {
                if (this.unionFind.find(i) === root) componentIndices.push(i);
            }
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
            const queue = [[startLineIndex]];
            const visited = new Set([startLineIndex]);
            while (queue.length > 0) {
                const path = queue.shift();
                const lastNode = path[path.length - 1];
                if (this.finisherLines.has(lastNode)) {
                    return path.map(index => this.lines[index]);
                }
                const neighbors = adj.get(lastNode) || [];
                for (const neighbor of neighbors) {
                    if (!visited.has(neighbor)) {
                        visited.add(neighbor);
                        queue.push([...path, neighbor]);
                    }
                }
            }
            return [];
        }

        _findAllClustersOptimized() {
            const clusters = new Map();
            for (let i = 0; i < this.lines.length; i++) {
                const root = this.unionFind.find(i);
                if (!clusters.has(root)) clusters.set(root, []);
                clusters.get(root).push(i);
            }
            return Array.from(clusters.values());
        }
    }

    // --- Module Export ---
    if (typeof module !== 'undefined' && module.exports) {
        // Node.js
        module.exports = { SimulationEngine };
    } else {
        // Browser
        global.SimulationEngine = SimulationEngine;
    }

})(typeof window !== 'undefined' ? window : this);
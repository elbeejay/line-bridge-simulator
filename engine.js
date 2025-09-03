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
            maxAngle: 360
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
     * Executes one step of the simulation.
     * It generates a new line, adds it to the list, and checks for a connection.
     * If a bridge is formed, it stops the simulation.
     */
    runStep() {
        // Don't run if the simulation is paused or stopped.
        if (!this.isRunning) {
            return;
        }

        // 1. Generate a new line using our helper method.
        const newLine = this._generateRandomLine();

        // 2. Add it to our list of lines and increment the count.
        this.lines.push(newLine);
        this.lineCount++;

        // 3. Check if a bridge has been formed.
        // This function will be defined in `utils.js`.
        // The check can be computationally expensive, so we only run it when a new line is added.
        const bridgeResult = checkForBridge(this.lines, this.bridgeArea);

        // 4. If a bridge exists, stop the simulation.
        if (bridgeResult.pathFound) {
            this.isRunning = false;
            // (Optional) Store the path for highlighting later.
            this.connectingPath = bridgeResult.path;
            console.log(`Bridge formed with ${this.lineCount} lines!`);
        }
    }
}

console.log("engine.js loaded with SimulationEngine class.");

(function(global) {
    'use strict';

    // --- Dependency Loading ---
    // This pattern allows the module to work in both Node.js and the browser.
    let SimulationEngine;

    if (typeof module !== 'undefined' && module.exports) {
        // We are in a Node.js environment, so we load dependencies with require.
        SimulationEngine = require('./engine.js').SimulationEngine;
    } else {
        // We are in a browser environment, so we'll use the global variable.
        SimulationEngine = global.SimulationEngine;
    }

    /**
     * A class to run multiple simulations and compute statistics.
     */
    class StatisticsEngine {
        /**
         * @param {object} canvasDimensions - The dimensions of the canvas ({ width, height }).
         * @param {object} simulationParameters - The parameters for the simulation.
         */
        constructor(canvasDimensions, simulationParameters) {
            this.canvasDimensions = canvasDimensions;
            this.simulationParameters = simulationParameters;
            this.results = [];
        }

        /**
         * Runs a single simulation to completion.
         * @returns {number} The number of lines required to form a bridge.
         */
        runSingleSimulation() {
            const engine = new SimulationEngine(this.canvasDimensions, this.simulationParameters);
            engine.isRunning = true;
            const maxSteps = 100000; // Safeguard against infinite loops
            let steps = 0;
            while (engine.isRunning && steps < maxSteps) {
                engine.runStep();
                steps++;
            }
            return engine.lineCount;
        }

        /**
         * Runs a specified number of simulations asynchronously.
         * @param {number} numSimulations - The total number of simulations to run.
         * @param {function(number, number)} [progressCallback] - Optional callback for progress updates.
         * @returns {Promise<object>} A promise that resolves with the final statistics object.
         */
        async runSimulationsAsync(numSimulations, progressCallback) {
            this.results = [];

            // This function runs a small "chunk" of simulations, then yields
            // to the event loop to prevent freezing the UI.
            const runChunk = (start) => {
                return new Promise(resolve => {
                    const chunkSize = 5; // Number of simulations per chunk
                    const end = Math.min(start + chunkSize, numSimulations);

                    for (let i = start; i < end; i++) {
                        const lineCount = this.runSingleSimulation();
                        this.results.push(lineCount);
                        if (progressCallback) {
                            progressCallback(i + 1, numSimulations);
                        }
                    }

                    if (end < numSimulations) {
                        // Schedule the next chunk
                        setTimeout(() => runChunk(end).then(resolve), 0);
                    } else {
                        // All simulations are complete
                        resolve();
                    }
                });
            };

            await runChunk(0);
            return this.calculateStatistics();
        }

        /**
         * Calculates statistics from the collected simulation results.
         * @returns {{mean: number, median: number, min: number, max: number, count: number}}
         */
        calculateStatistics() {
            const count = this.results.length;
            if (count === 0) {
                return { mean: 0, median: 0, min: 0, max: 0, count: 0 };
            }

            this.results.sort((a, b) => a - b);

            const sum = this.results.reduce((total, val) => total + val, 0);
            const mean = sum / count;
            const min = this.results[0];
            const max = this.results[count - 1];

            let median;
            const mid = Math.floor(count / 2);
            if (count % 2 === 0) {
                median = (this.results[mid - 1] + this.results[mid]) / 2;
            } else {
                median = this.results[mid];
            }

            return {
                mean: parseFloat(mean.toFixed(2)),
                median,
                min,
                max,
                count,
            };
        }
    }

    // --- Module Export ---
    if (typeof module !== 'undefined' && module.exports) {
        // Node.js
        module.exports = { StatisticsEngine };
    } else {
        // Browser
        global.StatisticsEngine = StatisticsEngine;
    }

})(typeof window !== 'undefined' ? window : this);
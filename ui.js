// Module 2: 🎨 User Interface & Controls (`ui.js`)

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const canvasEl = document.getElementById('simulation-canvas');
    const startButton = document.getElementById('start-button');
    const pauseButton = document.getElementById('pause-button');
    const resetButton = document.getElementById('reset-button');
    const lineCountDisplay = document.getElementById('line-count');
    const resultMessageDisplay = document.getElementById('result-message');
    const bridgeAreaSizeDisplay = document.getElementById('bridge-area-size');

    // Parameter Controls
    const minLengthInput = document.getElementById('min-length');
    const maxLengthInput = document.getElementById('max-length');
    const minAngleInput = document.getElementById('min-angle');
    const maxAngleInput = document.getElementById('max-angle');
    const boundaryConditionInput = document.getElementById('boundary-condition');

    const minLengthSlider = document.getElementById('min-length-slider');
    const maxLengthSlider = document.getElementById('max-length-slider');
    const minAngleSlider = document.getElementById('min-angle-slider');
    const maxAngleSlider = document.getElementById('max-angle-slider');

    // --- Canvas & Renderer Setup ---
    const { canvas, ctx } = setupCanvas('simulation-canvas');
    if (!canvas) {
        console.error("UI setup failed: Canvas not found.");
        return;
    }

    // --- Simulation Engine Initialization ---
    const initialParams = {
        minLength: parseInt(minLengthInput.value),
        maxLength: parseInt(maxLengthInput.value),
        minAngle: parseInt(minAngleInput.value),
        maxAngle: parseInt(maxAngleInput.value),
    };
    const engine = new SimulationEngine({ width: canvas.width, height: canvas.height }, initialParams);

    // Update the newly added display for the red area size on initial load
    if (engine.bridgeArea) {
        bridgeAreaSizeDisplay.textContent = `${engine.bridgeArea.width} x ${engine.bridgeArea.height}`;
    }

    // --- Main Application State & Logic ---
    let animationFrameId = null;

    /**
     * The main loop for the simulation, run on every animation frame.
     */
    function mainLoop() {
        if (engine.isRunning) {
            engine.runStep();
            updateDisplays();

            // If a bridge was found in the last step, stop the simulation
            if (!engine.isRunning) {
                resultMessageDisplay.textContent = `Bridge formed with ${engine.lineCount} lines!`;
            }
        }

        render(ctx, canvas, engine, engine.bridgeArea); // Render the current state

        // Highlight the final path if one was found.
        if (engine.connectingPath && engine.connectingPath.length > 0) {
            // The connectingPath is now an array of line objects, not indices.
            highlightPath(ctx, engine.connectingPath, 'blue');
        }

        animationFrameId = requestAnimationFrame(mainLoop);
    }

    /**
     * Updates the text displays with the current simulation data.
     */
    function updateDisplays() {
        lineCountDisplay.textContent = engine.lineCount;
    }

    /**
     * Resets the entire simulation and UI to the initial state.
     */
    function resetSimulation() {
        engine.isRunning = false;
        engine.reset();
        engine.simulationParameters = getParametersFromUI(); // Re-read UI params
        updateDisplays();
        resultMessageDisplay.textContent = 'Not started';

        render(ctx, canvas, engine, engine.bridgeArea); // Re-render the cleared state
    }

    /**
     * Reads the current values from all UI input controls.
     * @returns {object} The simulation parameters.
     */
    function getParametersFromUI() {
        return {
            minLength: parseInt(minLengthInput.value),
            maxLength: parseInt(maxLengthInput.value),
            minAngle: parseInt(minAngleInput.value),
            maxAngle: parseInt(maxAngleInput.value),
            boundaryCondition: boundaryConditionInput.value,
        };
    }

    // --- Event Listeners ---

    startButton.addEventListener('click', () => {
        if (!engine.isRunning) {
            engine.isRunning = true;
            resultMessageDisplay.textContent = 'Running...';
        }
    });

    pauseButton.addEventListener('click', () => {
        engine.isRunning = false;
        if (engine.lineCount > 0) {
            resultMessageDisplay.textContent = 'Paused';
        }
    });

    resetButton.addEventListener('click', resetSimulation);

    // --- Unified Input Syncing, Validation, and Parameter Updates ---

    /**
     * Sets up event listeners for a pair of min/max controls (e.g., min/max length).
     * This single handler syncs sliders with number inputs, validates the min <= max
     * constraint, and updates the slider's min/max attributes to prevent clamping issues.
     * @param {HTMLElement} minInput  - The number input for the minimum value.
     * @param {HTMLElement} maxInput  - The number input for the maximum value.
     * @param {HTMLElement} minSlider - The range slider for the minimum value.
     * @param {HTMLElement} maxSlider - The range slider for the maximum value.
     */
    function setupRangeControls(minInput, maxInput, minSlider, maxSlider) {
        const controls = [minInput, maxInput, minSlider, maxSlider];

        function handleInput(event) {
            const source = event.target;

            // Step 1: Sync the value from the source element to its pair (e.g., input -> slider).
            if (source === minInput) minSlider.value = minInput.value;
            else if (source === minSlider) minInput.value = minSlider.value;
            else if (source === maxInput) maxSlider.value = maxInput.value;
            else if (source === maxSlider) maxInput.value = maxSlider.value;

            // Step 2: Get the integer values from the number inputs.
            let minVal = parseInt(minInput.value);
            let maxVal = parseInt(maxInput.value);

            // Step 3: Enforce the min <= max constraint.
            if (minVal > maxVal) {
                if (source === minInput || source === minSlider) {
                    // If a "min" control caused the violation, push "max" up.
                    maxVal = minVal;
                    maxInput.value = maxVal;
                    maxSlider.value = maxVal;
                } else {
                    // If a "max" control caused the violation, pull "min" down.
                    minVal = maxVal;
                    minInput.value = minVal;
                    minSlider.value = minVal;
                }
            }

            // Step 4: Dynamically update the sliders' min/max attributes.
            // This prevents the browser from clamping the values and makes the UI more intuitive.
            minSlider.max = maxVal;
            maxSlider.min = minVal;

            // Step 5: Update the simulation engine with the validated parameters.
            engine.simulationParameters = getParametersFromUI();
        }

        controls.forEach(control => control.addEventListener('input', handleInput));
    }

    // Set up the handlers for both length and angle controls.
    setupRangeControls(minLengthInput, maxLengthInput, minLengthSlider, maxLengthSlider);
    setupRangeControls(minAngleInput, maxAngleInput, minAngleSlider, maxAngleSlider);

    // The boundary condition dropdown is separate and only needs a simple listener.
    boundaryConditionInput.addEventListener('change', () => {
        engine.simulationParameters = getParametersFromUI();
    });

    // --- Initial Setup ---
    resetSimulation(); // Set the initial state correctly
    mainLoop(); // Start the animation loop

    console.log("ui.js loaded and application initialized.");
});

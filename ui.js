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
            const pathLines = engine.connectingPath.map(i => engine.lines[i]);
            highlightPath(ctx, pathLines, 'blue');
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

    // Sync sliders and number inputs
    const setupSliderSync = (slider, input) => {
        slider.addEventListener('input', () => input.value = slider.value);
        input.addEventListener('change', () => slider.value = input.value);
    };

    setupSliderSync(minLengthSlider, minLengthInput);
    setupSliderSync(maxLengthSlider, maxLengthInput);
    setupSliderSync(minAngleSlider, minAngleInput);
    setupSliderSync(maxAngleSlider, maxAngleInput);

    // Update engine parameters when any control changes
    [minLengthInput, maxLengthInput, minAngleInput, maxAngleInput,
     minLengthSlider, maxLengthSlider, minAngleSlider, maxAngleSlider].forEach(input => {
        input.addEventListener('change', () => {
            engine.simulationParameters = getParametersFromUI();
        });
    });

    // --- Initial Setup ---
    resetSimulation(); // Set the initial state correctly
    mainLoop(); // Start the animation loop

    console.log("ui.js loaded and application initialized.");
});

// Module 2: 🎨 User Interface & Controls (`ui.js`)

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const canvasEl = document.getElementById('simulation-canvas');
    const startButton = document.getElementById('start-button');
    const pauseButton = document.getElementById('pause-button');
    const resetButton = document.getElementById('reset-button');
    const lineCountDisplay = document.getElementById('line-count');
    const resultMessageDisplay = document.getElementById('result-message');

    // Parameter Controls
    const minLengthInput = document.getElementById('min-length');
    const maxLengthInput = document.getElementById('max-length');
    const minAngleInput = document.getElementById('min-angle');
    const maxAngleInput = document.getElementById('max-angle');

    const minLengthSlider = document.getElementById('min-length-slider');
    const maxLengthSlider = document.getElementById('max-length-slider');
    const minAngleSlider = document.getElementById('min-angle-slider');
    const maxAngleSlider = document.getElementById('max-angle-slider');
    const bridgeMarginInput = document.getElementById('bridge-margin');
    const bridgeMarginSlider = document.getElementById('bridge-margin-slider');

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
        bridgeMargin: parseInt(bridgeMarginInput.value),
    };
    const engine = new SimulationEngine({ width: canvas.width, height: canvas.height }, initialParams);

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
                // (Optional) Highlight the final path
                // const bridge = checkForBridge(engine.lines, engine.canvasDimensions);
                // if (bridge.pathFound) {
                //     highlightPath(ctx, bridge.path.map(i => engine.lines[i]));
                // }
            }
        }

        render(ctx, canvas, engine, engine.bridgeArea); // Render the current state
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
            bridgeMargin: parseInt(bridgeMarginInput.value),
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
    setupSliderSync(bridgeMarginSlider, bridgeMarginInput);

    // Update engine parameters when any control changes
    [minLengthInput, maxLengthInput, minAngleInput, maxAngleInput, bridgeMarginInput,
     minLengthSlider, maxLengthSlider, minAngleSlider, maxAngleSlider, bridgeMarginSlider].forEach(input => {
        input.addEventListener('change', () => {
            engine.simulationParameters = getParametersFromUI();
            // The engine needs to be notified to recalculate the bridge area
            if (engine.updateBridgeArea) {
                engine.updateBridgeArea();
            }
        });
    });

    // --- Initial Setup ---
    resetSimulation(); // Set the initial state correctly
    mainLoop(); // Start the animation loop

    console.log("ui.js loaded and application initialized.");
});

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

    // Statistical Analysis UI Elements
    const runAnalysisButton = document.getElementById('run-analysis-button');
    const numSimulationsInput = document.getElementById('num-simulations');
    const analysisProgressContainer = document.getElementById('analysis-progress-container');
    const analysisProgressText = document.getElementById('analysis-progress-text');
    const analysisProgressBar = document.getElementById('analysis-progress-bar');
    const analysisResultsContainer = document.getElementById('analysis-results-container');
    const analysisRunsDisplay = document.getElementById('analysis-runs');
    const analysisMeanDisplay = document.getElementById('analysis-mean');
    const analysisMedianDisplay = document.getElementById('analysis-median');
    const analysisMinDisplay = document.getElementById('analysis-min');
    const analysisMaxDisplay = document.getElementById('analysis-max');


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
     minLengthSlider, maxLengthSlider, minAngleSlider, maxAngleSlider, boundaryConditionInput].forEach(input => {
        input.addEventListener('change', () => {
            engine.simulationParameters = getParametersFromUI();
        });
    });

    // --- Statistical Analysis Logic ---

    /**
     * Toggles the disabled state of all simulation controls.
     * @param {boolean} isEnabled - Whether the controls should be enabled.
     */
    function setControlsEnabled(isEnabled) {
        const controls = [
            startButton, pauseButton, resetButton,
            minLengthInput, maxLengthInput, minAngleInput, maxAngleInput,
            minLengthSlider, maxLengthSlider, minAngleSlider, maxAngleSlider,
            boundaryConditionInput, runAnalysisButton, numSimulationsInput
        ];
        controls.forEach(control => control.disabled = !isEnabled);
    }

    /**
     * Handles the "Run Analysis" button click event.
     */
    async function handleRunAnalysis() {
        // 1. Stop any running simulation and disable controls
        engine.isRunning = false;
        setControlsEnabled(false);
        resultMessageDisplay.textContent = 'Preparing analysis...';

        // 2. Get parameters
        const numSimulations = parseInt(numSimulationsInput.value, 10);
        if (isNaN(numSimulations) || numSimulations <= 0) {
            alert("Please enter a valid number of simulations.");
            setControlsEnabled(true);
            return;
        }
        const simulationParameters = getParametersFromUI();
        const canvasDimensions = { width: canvas.width, height: canvas.height };

        // 3. Setup UI for analysis
        analysisProgressContainer.style.display = 'block';
        analysisResultsContainer.style.display = 'none';
        analysisProgressBar.value = 0;
        analysisProgressBar.max = numSimulations;

        const progressCallback = (current, total) => {
            analysisProgressText.textContent = `Running ${current}/${total}...`;
            analysisProgressBar.value = current;
            resultMessageDisplay.textContent = 'Analysis in progress...';
        };

        // 4. Run the analysis
        try {
            const statsEngine = new StatisticsEngine(canvasDimensions, simulationParameters);
            const stats = await statsEngine.runSimulationsAsync(numSimulations, progressCallback);

            // 5. Display results
            analysisResultsContainer.style.display = 'block';
            analysisRunsDisplay.textContent = stats.count;
            analysisMeanDisplay.textContent = stats.mean;
            analysisMedianDisplay.textContent = stats.median;
            analysisMinDisplay.textContent = stats.min;
            analysisMaxDisplay.textContent = stats.max;
            resultMessageDisplay.textContent = 'Analysis complete!';

        } catch (error) {
            console.error("An error occurred during statistical analysis:", error);
            resultMessageDisplay.textContent = 'Analysis failed. See console for details.';
        } finally {
            // 6. Re-enable controls
            setControlsEnabled(true);
            analysisProgressContainer.style.display = 'none';
        }
    }

    runAnalysisButton.addEventListener('click', handleRunAnalysis);


    // --- Initial Setup ---
    resetSimulation(); // Set the initial state correctly
    mainLoop(); // Start the animation loop

    console.log("ui.js loaded and application initialized.");
});

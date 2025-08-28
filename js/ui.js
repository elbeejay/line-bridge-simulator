import { SimulationEngine } from './engine.js';
import { setupCanvas, render, highlightPath } from './renderer.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- SETUP ---
    const { canvas, ctx } = setupCanvas('simulation-canvas');
    if (!canvas) return;

    let engine = new SimulationEngine({ width: canvas.width, height: canvas.height });
    let animationFrameId = null;

    // --- DOM ELEMENTS ---
    const minLengthInput = document.getElementById('min-length');
    const minLengthSlider = document.getElementById('min-length-slider');
    const maxLengthInput = document.getElementById('max-length');
    const maxLengthSlider = document.getElementById('max-length-slider');
    const minAngleInput = document.getElementById('min-angle');
    const minAngleSlider = document.getElementById('min-angle-slider');
    const maxAngleInput = document.getElementById('max-angle');
    const maxAngleSlider = document.getElementById('max-angle-slider');

    const startButton = document.getElementById('start-button');
    const pauseButton = document.getElementById('pause-button');
    const resetButton = document.getElementById('reset-button');

    const lineCountDisplay = document.getElementById('line-count');
    const resultMessageDisplay = document.getElementById('result-message');

    // --- UI INITIALIZATION ---
    function updateEngineParameters() {
        engine.simulationParameters = {
            minLength: parseInt(minLengthInput.value, 10),
            maxLength: parseInt(maxLengthInput.value, 10),
            minAngle: parseInt(minAngleInput.value, 10),
            maxAngle: parseInt(maxAngleInput.value, 10),
        };
    }

    // Initialize with default values
    updateEngineParameters();
    render(ctx, canvas, engine);

    // --- MAIN SIMULATION LOOP ---
    function simulationLoop() {
        if (!engine.isRunning) {
            cancelAnimationFrame(animationFrameId);
            return;
        }

        engine.runStep();
        render(ctx, canvas, engine);
        lineCountDisplay.textContent = engine.lineCount;

        if (engine.isRunning) {
            animationFrameId = requestAnimationFrame(simulationLoop);
        } else {
            resultMessageDisplay.textContent = `Bridge formed with ${engine.lineCount} lines!`;
            // Optional: Highlight the path
            // if (engine.connectingPath) {
            //     highlightPath(ctx, engine.connectingPath, 'red');
            // }
        }
    }

    // --- EVENT LISTENERS ---
    // Link sliders and number inputs
    [
        [minLengthSlider, minLengthInput],
        [maxLengthSlider, maxLengthInput],
        [minAngleSlider, minAngleInput],
        [maxAngleSlider, maxAngleInput]
    ].forEach(([slider, input]) => {
        slider.addEventListener('input', () => input.value = slider.value);
        input.addEventListener('change', () => slider.value = input.value);
        // Update engine params when either changes
        slider.addEventListener('input', updateEngineParameters);
        input.addEventListener('change', updateEngineParameters);
    });

    // Button controls
    startButton.addEventListener('click', () => {
        if (!engine.isRunning) {
            engine.isRunning = true;
            resultMessageDisplay.textContent = 'Running...';
            simulationLoop();
        }
    });

    pauseButton.addEventListener('click', () => {
        engine.isRunning = false;
        resultMessageDisplay.textContent = 'Paused.';
    });

    resetButton.addEventListener('click', () => {
        engine.isRunning = false;
        cancelAnimationFrame(animationFrameId);
        engine.reset();
        updateEngineParameters(); // Re-apply current slider values
        render(ctx, canvas, engine);
        lineCountDisplay.textContent = '0';
        resultMessageDisplay.textContent = 'Not started';
    });

    console.log('ui.js loaded and initialized.');
});

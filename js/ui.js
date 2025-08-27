// UI Controller (`ui.js`)
// This module handles all user interactions, reads values from controls,
// and dispatches events to the other modules.

// DOM Elements
const minLengthSlider = document.getElementById('min-length-slider');
const minLengthInput = document.getElementById('min-length');
const maxLengthSlider = document.getElementById('max-length-slider');
const maxLengthInput = document.getElementById('max-length');
const minAngleSlider = document.getElementById('min-angle-slider');
const minAngleInput = document.getElementById('min-angle');
const maxAngleSlider = document.getElementById('max-angle-slider');
const maxAngleInput = document.getElementById('max-angle');

const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');
const resetButton = document.getElementById('reset-button');

// Event Listeners for sliders and number inputs
minLengthSlider.addEventListener('input', (e) => {
    minLengthInput.value = e.target.value;
    console.log(`Min length slider changed to: ${e.target.value}`);
});

minLengthInput.addEventListener('input', (e) => {
    minLengthSlider.value = e.target.value;
    console.log(`Min length input changed to: ${e.target.value}`);
});

maxLengthSlider.addEventListener('input', (e) => {
    maxLengthInput.value = e.target.value;
    console.log(`Max length slider changed to: ${e.target.value}`);
});

maxLengthInput.addEventListener('input', (e) => {
    maxLengthSlider.value = e.target.value;
    console.log(`Max length input changed to: ${e.target.value}`);
});

minAngleSlider.addEventListener('input', (e) => {
    minAngleInput.value = e.target.value;
    console.log(`Min angle slider changed to: ${e.target.value}`);
});

minAngleInput.addEventListener('input', (e) => {
    minAngleSlider.value = e.target.value;
    console.log(`Min angle input changed to: ${e.target.value}`);
});

maxAngleSlider.addEventListener('input', (e) => {
    maxAngleInput.value = e.target.value;
    console.log(`Max angle slider changed to: ${e.target.value}`);
});

maxAngleInput.addEventListener('input', (e) => {
    maxAngleSlider.value = e.target.value;
    console.log(`Max angle input changed to: ${e.target.value}`);
});


// Event Listeners for buttons
startButton.addEventListener('click', () => {
    console.log('Start button clicked');
    // In the future, this will call a function in engine.js
});

pauseButton.addEventListener('click', () => {
    console.log('Pause button clicked');
    // In the future, this will call a function in engine.js
});

resetButton.addEventListener('click', () => {
    console.log('Reset button clicked');
    // In the future, this will call a function in engine.js
});

console.log("ui.js loaded and event listeners attached.");

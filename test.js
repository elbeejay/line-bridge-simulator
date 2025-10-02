const { SimulationEngine } = require('./engine.js');
const { intersects } = require('./utils.js'); // Also test intersects directly

let failures = 0;

function runTest(name, condition) {
    if (condition) {
        console.log(`PASS: ${name}`);
    } else {
        console.error(`FAIL: ${name}`);
        failures++;
    }
}

console.log('--- Running Tests for intersects() ---');

// Test case 1: Simple intersection
const line1 = { x1: 10, y1: 10, x2: 100, y2: 100 };
const line2 = { x1: 10, y1: 100, x2: 100, y2: 10 };
runTest('Test 1 (Simple Intersection)', intersects(line1, line2) === true);

// Test case 2: No intersection
const line3 = { x1: 10, y1: 10, x2: 50, y2: 50 };
const line4 = { x1: 60, y1: 60, x2: 100, y2: 100 };
runTest('Test 2 (No Intersection)', intersects(line3, line4) === false);

// Test case 3: Collinear and overlapping
const line5 = { x1: 0, y1: 0, x2: 50, y2: 0 };
const line6 = { x1: 25, y1: 0, x2: 75, y2: 0 };
runTest('Test 3 (Collinear, Overlapping)', intersects(line5, line6) === true);


console.log('\n--- Running Tests for SimulationEngine Bridge Detection ---');

const CANVAS_DIMENSIONS = { width: 500, height: 400 };
const SIMULATION_PARAMS = {
    minLength: 10,
    maxLength: 50,
    minAngle: 0,
    maxAngle: 360,
    boundaryCondition: 'left-to-right',
};

// --- Helper function to run a single test case ---
function testBridgeScenario(testName, lines, expectedPath, boundaryCondition = 'left-to-right') {
    // Create a new engine for each test case to ensure isolation
    const engine = new SimulationEngine(CANVAS_DIMENSIONS, { ...SIMULATION_PARAMS, boundaryCondition });
    engine.isRunning = true; // Pretend the simulation is running

    // Manually override the line generation for predictable tests
    let lineCounter = 0;
    engine._generateRandomLine = () => {
        if (lineCounter < lines.length) {
            return lines[lineCounter++];
        }
        return { x1: 0, y1: 0, x2: 0, y2: 0 }; // Default fallback
    };

    // Run a step for each line to be added
    for (let i = 0; i < lines.length; i++) {
        engine.runStep();
    }

    const pathFound = engine.connectingPath.length > 0;
    const expectedPathFound = expectedPath.length > 0;

    runTest(`${testName} - Bridge Found`, pathFound === expectedPathFound);

    if (expectedPathFound) {
        const pathIsCorrect = JSON.stringify(engine.connectingPath.map(l => lines.indexOf(l))) === JSON.stringify(expectedPath);
        runTest(`${testName} - Correct Path`, pathIsCorrect);
    }
}

// Test Case 4: Simple Left-to-Right Bridge
const bridgeLines = [
    { x1: 10, y1: 50, x2: 100, y2: 50 },      // 0: Touches left
    { x1: 90, y1: 40, x2: 200, y2: 150 },    // 1: Intersects with first
    { x1: 190, y1: 140, x2: 460, y2: 200 }   // 2: Intersects with second, touches right
];
testBridgeScenario('Test 4 (Simple Bridge)', bridgeLines, [0, 1, 2]);

// Test Case 5: No Bridge
const noBridgeLines = [
    { x1: 10, y1: 50, x2: 100, y2: 50 },      // 0: Touches left
    { x1: 200, y1: 100, x2: 300, y2: 100 },  // 1: Does not intersect
    { x1: 450, y1: 150, x2: 480, y2: 150 }   // 2: Touches right
];
testBridgeScenario('Test 5 (No Bridge)', noBridgeLines, []);

// Test Case 6: Top-to-Bottom Bridge
const topToBottomLines = [
    { x1: 100, y1: 10, x2: 100, y2: 100 },   // 0: Touches top
    { x1: 90, y1: 90, x2: 200, y2: 200 },    // 1: Intersects
    { x1: 190, y1: 190, x2: 300, y2: 370 }   // 2: Intersects and touches bottom
];
testBridgeScenario('Test 6 (Top-to-Bottom Bridge)', topToBottomLines, [0, 1, 2], 'top-to-bottom');

// Test Case 7: Starter is also a Finisher
const shortBridgeLine = [{ x1: 10, y1: 50, x2: 460, y2: 50 }];
testBridgeScenario('Test 7 (Short Bridge)', shortBridgeLine, [0]);


if (failures > 0) {
    console.error(`\n${failures} test(s) failed.`);
    process.exit(1); // Exit with a failure code
} else {
    console.log('\nAll tests passed!');
    process.exit(0); // Exit with a success code
}
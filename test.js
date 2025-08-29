const { intersects, checkForBridge } = require('./utils.js');

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

// Test case 4: Collinear and non-overlapping
const line7 = { x1: 0, y1: 0, x2: 50, y2: 0 };
const line8 = { x1: 60, y1: 0, x2: 100, y2: 0 };
runTest('Test 4 (Collinear, Non-Overlapping)', intersects(line7, line8) === false);

// Test case 5: Parallel lines
const line9 = { x1: 10, y1: 10, x2: 100, y2: 10 };
const line10 = { x1: 10, y1: 20, x2: 100, y2: 20 };
runTest('Test 5 (Parallel)', intersects(line9, line10) === false);

console.log('\n--- Running Tests for checkForBridge() ---');
const CANVAS_DIMENSIONS = { width: 500, height: 400 };

// Test case 6: Simple connected bridge
const bridgeLines = [
    { x1: 0, y1: 50, x2: 100, y2: 50 },      // Touches left
    { x1: 90, y1: 40, x2: 200, y2: 150 },   // Intersects with first
    { x1: 190, y1: 140, x2: CANVAS_DIMENSIONS.width, y2: 200 } // Intersects with second, touches right
];
runTest('Test 6 (Connected Bridge)', checkForBridge(bridgeLines, CANVAS_DIMENSIONS).pathFound === true);

// Test case 7: No connected bridge
const noBridgeLines = [
    { x1: 0, y1: 50, x2: 100, y2: 50 },      // Touches left
    { x1: 200, y1: 100, x2: 300, y2: 100 },  // Does not intersect
    { x1: 400, y1: 150, x2: CANVAS_DIMENSIONS.width, y2: 150 } // Touches right
];
runTest('Test 7 (No Bridge)', checkForBridge(noBridgeLines, CANVAS_DIMENSIONS).pathFound === false);

// Test case 8: Empty lines array
runTest('Test 8 (Empty Array)', checkForBridge([], CANVAS_DIMENSIONS).pathFound === false);

// Test case 9: Lines touch left, but no path to right
const leftOnlyLines = [
    { x1: 0, y1: 50, x2: 100, y2: 50 },
    { x1: 0, y1: 150, x2: 100, y2: 150 }
];
runTest('Test 9 (Left-touching only)', checkForBridge(leftOnlyLines, CANVAS_DIMENSIONS).pathFound === false);

if (failures > 0) {
    console.error(`\n${failures} test(s) failed.`);
    process.exit(1); // Exit with a failure code
} else {
    console.log('\nAll tests passed!');
    process.exit(0); // Exit with a success code
}

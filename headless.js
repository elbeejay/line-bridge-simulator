const { StatisticsEngine } = require('./statistics.js');

// --- Configuration ---
const CANVAS_DIMENSIONS = { width: 800, height: 600 };
const SIMULATION_PARAMS = {
    minLength: 10,
    maxLength: 50,
    minAngle: 0,
    maxAngle: 360,
    boundaryCondition: 'left-to-right',
};

/**
 * Main function to run the headless simulation analysis.
 */
async function main() {
    // Determine the number of simulations from command-line arguments
    const args = process.argv.slice(2);
    const numSimulations = args.length > 0 ? parseInt(args[0], 10) : 100;

    if (isNaN(numSimulations) || numSimulations <= 0) {
        console.error("Error: Please provide a positive integer for the number of simulations.");
        console.log("Usage: node headless.js [number_of_simulations]");
        process.exit(1);
    }

    console.log(`--- Running Line Bridge Simulation Analysis ---`);
    console.log(`Configuration:`);
    console.log(`  - Canvas: ${CANVAS_DIMENSIONS.width}x${CANVAS_DIMENSIONS.height}`);
    console.log(`  - Line Length: ${SIMULATION_PARAMS.minLength}-${SIMULATION_PARAMS.maxLength}`);
    console.log(`  - Line Angle: ${SIMULATION_PARAMS.minAngle}-${SIMULATION_PARAMS.maxAngle}`);
    console.log(`  - Boundary: ${SIMULATION_PARAMS.boundaryCondition}`);
    console.log(`\nRunning ${numSimulations} simulations...`);

    // --- Progress Bar ---
    const progressBarLength = 40;
    function printProgress(current, total) {
        const percent = (current / total);
        const filledLength = Math.round(progressBarLength * percent);
        const bar = '█'.repeat(filledLength) + '-'.repeat(progressBarLength - filledLength);
        // Use process.stdout.write to stay on the same line
        process.stdout.write(`\rProgress: [${bar}] ${current}/${total} (${(percent * 100).toFixed(2)}%)`);
    }

    // --- Simulation Execution ---
    const statsEngine = new StatisticsEngine(CANVAS_DIMENSIONS, SIMULATION_PARAMS);

    // Node.js doesn't need the async chunking for UI responsiveness,
    // so we can run the simulations in a tight loop for performance.
    // However, the async version with progress callback is more versatile.
    const stats = await statsEngine.runSimulationsAsync(numSimulations, (current, total) => {
        printProgress(current, total);
    });

    console.log('\n\n--- Analysis Complete ---');
    console.log(`Total simulations run: ${stats.count}`);
    console.log(`\nStatistical Results (Number of Lines to Bridge):`);
    console.log(`  - Mean:   ${stats.mean}`);
    console.log(`  - Median: ${stats.median}`);
    console.log(`  - Min:    ${stats.min}`);
    console.log(`  - Max:    ${stats.max}`);
    console.log('\n-------------------------');
}

// --- Script Entry Point ---
main().catch(error => {
    console.error("\nAn unexpected error occurred:", error);
    process.exit(1);
});
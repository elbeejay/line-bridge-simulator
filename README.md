# Line Bridge Simulator

A web-based simulation that visualizes percolation theory by randomly drawing lines until a continuous path connects two opposite sides of a boundary.

## About the Project

The **Line Bridge Simulator** is an interactive application that demonstrates a 2D percolation problem. Users can define parameters for line lengths and angles, then watch as the simulation randomly places lines on a canvas. The simulation stops once a "bridge"—a continuous chain of intersecting lines—is formed between two boundaries (e.g., left-to-right).

The primary output is the total number of lines required to form the bridge. This project features a modular architecture that separates the simulation logic, rendering, and UI, allowing for independent development and testing.

**Core Features:**
*   **Interactive Controls**: Set min/max line length and angle using sliders and number inputs.
*   **Boundary Toggling**: Choose the bridge condition, from "Left to Right" to "Top to Bottom."
*   **Dynamic Simulation**: Watch lines being placed in real-time.
*   **State Controls**: Start, pause, and reset the simulation.
*   **Live Data**: See the current line count and a final result message.
*   **Cluster Visualization**: Connected line clusters are rendered in unique colors for a clear view of the process.
*   **Path Highlighting**: The final connecting path is highlighted in a distinct color.
*   **Statistical Analysis**: Run bulk simulations to calculate mean, median, min, and max results, available in both the UI and a headless script.

## Getting Started

### Running the Simulation
No build steps are required. Simply open `index.html` in a modern web browser.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/line-bridge-simulator.git
    ```
2.  **Navigate to the directory:**
    ```bash
    cd line-bridge-simulator
    ```
3.  **Open the HTML file:**
    Open `index.html` in your browser of choice.

### Running Tests
The project includes a suite of tests for its core logic. The tests are run using Node.js.

1.  **Ensure Node.js is installed.**
2.  **Run the test script from the root directory:**
    ```bash
    node test.js
    ```

## Advanced Data Analysis

The simulator includes tools for running a large number of simulations to gather statistical data on the number of lines required to form a bridge.

### In-Browser Analysis
You can run multiple simulations directly from the user interface:
1.  In the "Statistical Analysis" section of the control panel, enter the desired number of runs.
2.  Click the "Run Analysis" button.
3.  The simulation will run in the background, and the UI will display progress. Once complete, the statistical results (mean, median, min, max) will be shown in the "Simulation Status" panel.

### Headless (Command-Line) Analysis
For running a very large number of simulations or for automated testing, you can use the headless script. This requires Node.js.

1.  **Navigate to the project's root directory.**
2.  **Run the script with an optional number of simulations:**
    ```bash
    # Run 100 simulations (default)
    node headless.js

    # Run 500 simulations
    node headless.js 500
    ```
3.  The script will print the progress and display the final statistics in the terminal.

## Technical Architecture

The application is built with vanilla JavaScript and is divided into four decoupled modules to ensure maintainability and separation of concerns:

1.  **UI Controller (`ui.js`)**: Manages all user interactions and DOM elements. It dispatches events based on user input without any knowledge of the simulation's internal workings.
2.  **Simulation Engine (`engine.js`)**: Contains the core simulation logic. It manages state, generates random lines, and checks for connectivity using a `UnionFind` data structure. It is entirely independent of the DOM.
3.  **Rendering Engine (`renderer.js`)**: Handles all drawing on the HTML canvas. It visualizes the state provided by the simulation engine.
4.  **Utilities (`utils.js`)**: A collection of pure, standalone functions for mathematical calculations, including line intersection logic and the `UnionFind` class.

## Opportunities for Future Development

This project provides a solid foundation for exploring percolation theory. Future enhancements could include:

*   **Performance Optimizations**: Implement a Quadtree to optimize intersection detection for a very large number of lines.
*   **Robust Line Generation**: Improve the line generation algorithm to more efficiently create lines that are guaranteed to be within the canvas, especially when parameters are restrictive.
*   **UI Enhancements**: Add more robust input validation to prevent invalid parameter ranges (e.g., min length > max length).
# Line Bridge Simulator

A web-based simulation exploring concepts of percolation theory by randomly placing lines within a boundary until a contiguous path is formed from one side to the other.

   

-----

## 🎯 Project Description

The **Line Bridge Simulator** is an interactive application that demonstrates a 2D percolation problem. The user defines a set of parameters—specifically, the permissible range for line **lengths** and **angles**.

The simulation begins by randomly placing lines, one by one, onto a rectangular canvas. Each new line adheres to the user-defined parameters. After each placement, the simulation checks if a "bridge" has been formed. A bridge is a continuous, unbroken chain of intersecting lines that connects the **left boundary** of the canvas to the **right boundary**.

The simulation stops the moment a bridge is successfully formed. The primary output is the total **number of lines** required to achieve this connection. This project is designed with a highly modular architecture to allow different components (e.g., the simulation logic, the rendering engine, the user interface) to be developed and tested independently and in parallel.

-----

## ✨ Core Features

  * **Interactive Controls**: Sliders and input fields for setting the minimum/maximum line length and angle.
  * **Dynamic Simulation**: Watch lines being placed in real-time on an HTML canvas.
  * **State Controls**: Buttons to **Start**, **Stop/Pause**, and **Reset** the simulation.
  * **Live Data Output**: A display showing the current count of placed lines.
  * **Result Reporting**: A clear final report stating the number of lines required to form the bridge.
  * **(Optional) Highlighting**: The successful connecting path is highlighted in a distinct color upon completion.

-----

## 🏗️ Technical Architecture

To ensure modularity and enable parallel development, the application will be broken down into four primary, decoupled modules:

1.  **UI Controller (`ui.js`)**: Handles all user interactions. It reads values from the input controls and dispatches events. It does *not* know how the simulation runs or how to draw on the canvas. It only manages the user-facing elements.
2.  **Simulation Engine (`engine.js`)**: The core logic of the simulation. It maintains the state (the list of lines, running status), generates new lines according to the specified parameters, and uses the helper modules to check for a connection. It is completely independent of the DOM and the canvas.
3.  **Rendering Engine (`renderer.js`)**: Responsible for all drawing on the HTML canvas. It takes the state from the Simulation Engine and visually represents it. It doesn't know how the state is generated; it only knows how to draw it.
4.  **Utility Modules (`utils.js`)**: A set of pure, standalone functions for performing complex calculations.
      * **Intersection Module**: A function to determine if two line segments intersect.
      * **Connectivity Module**: A function that takes a list of lines and determines if a left-to-right bridge exists using a graph traversal algorithm (like BFS or DFS).

This separation of concerns means a developer can work on the intersection logic without touching any UI code, or another can refine the canvas drawing without understanding the core simulation loop.

-----

## 📝 Development Task Breakdown

Here are the specific, modular tasks required to build the simulator. They are grouped by module to facilitate parallel work.

### Module 1: 🧑‍💻 Simulation Engine (`engine.js`)

*This is the brain of the application. It runs the simulation and manages all the data.*

  - [x] **Task 1.1: Initialize Simulation State**

      - **Description**: Create a function or class that initializes and holds the simulation's state.
      - **State should include**: `lines` (an array of line objects), `isRunning` (boolean), `lineCount` (number), `simulationParameters` (object containing length/angle ranges), and `canvasDimensions` (width, height).

  - [x] **Task 1.2: Implement the Main Simulation Loop**

      - **Description**: Create a `runStep()` function that executes a single step of the simulation. This involves generating one line, adding it to the state, and then checking for a connection.
      - **Logic**:
        1.  Call the line generation function (Task 1.3).
        2.  Add the new line to the `lines` array.
        3.  Increment `lineCount`.
        4.  Call the connectivity checker (Task 4.2).
        5.  If a connection is found, set `isRunning` to `false`.

  - [x] **Task 1.3: Develop Random Line Generation Logic**

      - **Description**: Create a function that generates a new line object based on the current parameters. A key challenge is ensuring the *entire* line is within the canvas boundaries.
      - **Input**: `simulationParameters`, `canvasDimensions`.
      - **Output**: A line object, e.g., `{ x1, y1, x2, y2 }`.

### Module 2: 🎨 User Interface & Controls (`ui.js`)

*This module connects the user to the simulation engine through DOM elements.*

  - [x] **Task 2.1: Build HTML Structure for Controls**

      - **Description**: Create the HTML for all user inputs and displays.
      - **Elements**:
          - Sliders/number inputs for min/max line length.
          - Sliders/number inputs for min/max line angle (0-360 degrees).
          - "Start," "Pause," and "Reset" buttons.
          - A display area for the current line count.
          - A display area for the final result message.

  - [x] **Task 2.2: Implement Control Event Listeners**

      - **Description**: Write the JavaScript to handle user interactions. When a user clicks a button or changes a slider, this module will call the appropriate function in the Simulation Engine.
      - **Example**: The "Start" button's event listener should trigger a function that sets `engine.isRunning` to `true` and repeatedly calls `engine.runStep()`. The "Reset" button should call a function that clears the engine's state.

### Module 3: 🖼️ Rendering Engine (`renderer.js`)

*This module is solely responsible for drawing. It is a "dumb" component that just visualizes the data it's given.*

  - [x] **Task 3.1: Set Up the Canvas**

      - **Description**: Create a function to initialize the HTML `<canvas>` element, setting its dimensions and getting its 2D drawing context.

  - [x] **Task 3.2: Create a Line Drawing Function**

      - **Description**: Write a simple function that takes a line object (`{ x1, y1, x2, y2 }`) and a color, and draws it on the canvas.

  - [x] **Task 3.3: Implement the Main Render Function**

      - **Description**: Create a `render()` function that draws the entire simulation state.
      - **Logic**:
        1.  Clear the canvas completely.
        2.  Draw the rectangular boundary/background.
        3.  Loop through the `engine.state.lines` array and use the line drawing function (Task 3.2) to draw each one.

  - [x] **Task 3.4 (Stretch Goal): Implement Path Highlighting**

      - **Description**: After the simulation completes, the Connectivity Module (Task 4.2) should be able to return the specific lines that form the bridge. Create a function in the renderer to re-draw just those lines in a different color (e.g., bright red).

### Module 4: 🔧 Utility Modules (`utils.js`)

*These are pure, mathematical functions that can be developed and tested in complete isolation.*

  - [x] **Task 4.1: Implement Line Segment Intersection Logic**

      - **Description**: Write a function that determines if two line segments intersect. This is a classic computational geometry problem.
      - **Input**: Two line objects, e.g., `intersects(lineA, lineB)`.
      - **Output**: `true` or `false`.
      - **Note**: This function must be robust and handle all edge cases (collinear, touching at an endpoint, etc.).

  - [x] **Task 4.2: Develop the Graph Connectivity Algorithm**

      - **Description**: This is the most complex utility. This function will determine if a left-to-right bridge exists.
      - **Input**: An array of all `lines` and the `canvasDimensions`.
      - **Output**: A boolean (`true` if a bridge exists, `false` otherwise). Optionally, it can also return the array of lines that form the path.
      - **High-Level Logic**:
        1.  Identify two groups of lines: `left_starters` (lines touching the left edge) and `right_finishers` (lines touching the right edge).
        2.  Build an adjacency list graph where each line is a node and an edge exists between two nodes if their corresponding lines intersect (using Task 4.1).
        3.  Starting from every node in `left_starters`, perform a graph traversal (Breadth-First Search is a good choice).
        4.  If the traversal ever reaches a node that is in the `right_finishers` group, a path exists. Return `true`.
        5.  If all traversals complete without reaching a finisher, return `false`.

-----

## 🚀 Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/line-bridge-simulator.git
    ```
2.  **Navigate to the directory**:
    ```bash
    cd line-bridge-simulator
    ```
3.  **Open `index.html` in your browser.** There are no build steps required for this vanilla JS project.

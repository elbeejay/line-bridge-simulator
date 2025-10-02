// Module 4: Utility Modules
// This file will contain pure, mathematical functions for the Line Bridge Simulator.

// Task 4.1: Implement Line Segment Intersection Logic

/**
 * Determines if two line segments intersect.
 * @param {object} lineA - The first line segment with properties { x1, y1, x2, y2 }.
 * @param {object} lineB - The second line segment with properties { x1, y1, x2, y2 }.
 * @returns {boolean} - True if the line segments intersect, false otherwise.
 */
function intersects(lineA, lineB) {
    const p1 = { x: lineA.x1, y: lineA.y1 };
    const q1 = { x: lineA.x2, y: lineA.y2 };
    const p2 = { x: lineB.x1, y: lineB.y1 };
    const q2 = { x: lineB.x2, y: lineB.y2 };

    const o1 = orientation(p1, q1, p2);
    const o2 = orientation(p1, q1, q2);
    const o3 = orientation(p2, q2, p1);
    const o4 = orientation(p2, q2, q1);

    // General case
    if (o1 !== o2 && o3 !== o4) {
        return true;
    }

    // Special Cases
    // p1, q1 and p2 are collinear and p2 lies on segment p1q1
    if (o1 === 0 && onSegment(p1, p2, q1)) return true;

    // p1, q1 and q2 are collinear and q2 lies on segment p1q1
    if (o2 === 0 && onSegment(p1, q2, q1)) return true;

    // p2, q2 and p1 are collinear and p1 lies on segment p2q2
    if (o3 === 0 && onSegment(p2, p1, q2)) return true;

    // p2, q2 and q1 are collinear and q1 lies on segment p2q2
    if (o4 === 0 && onSegment(p2, q1, q2)) return true;

    return false; // Doesn't fall in any of the above cases
}

/**
 * Finds the orientation of the ordered triplet (p, q, r).
 * @param {object} p - Point with properties { x, y }.
 * @param {object} q - Point with properties { x, y }.
 * @param {object} r - Point with properties { x, y }.
 * @returns {number} - 0 if collinear, 1 if clockwise, 2 if counterclockwise.
 */
function orientation(p, q, r) {
    const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (val === 0) return 0;  // Collinear
    return (val > 0) ? 1 : 2; // Clockwise or Counterclockwise
}

/**
 * Checks if point q lies on segment pr.
 * @param {object} p - Point with properties { x, y }.
 * @param {object} q - Point with properties { x, y }.
 * @param {object} r - Point with properties { x, y }.
 * @returns {boolean} - True if point q lies on segment pr, false otherwise.
 */
function onSegment(p, q, r) {
    return (
        q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
        q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)
    );
}


// Task 4.2: Develop the Graph Connectivity Algorithm

/**
 * Checks if a set of lines forms a bridge from the left to the right side of a given area.
 * @param {Array<object>} lines - An array of line objects ({ x1, y1, x2, y2 }).
 * @param {object} bridgeArea - The area to check for a bridge within ({ x, y, width, height }).
 * @returns {object} - An object with `pathFound` (boolean) and `path` (array of line indices).
 */
function checkForBridge(lines, bridgeArea) {
    if (lines.length === 0) {
        return { pathFound: false, path: [] };
    }

    const leftStarters = [];
    const rightFinishers = new Set();

    const leftBoundary = bridgeArea.x;
    const rightBoundary = bridgeArea.x + bridgeArea.width;

    // A small tolerance is necessary for floating-point comparisons to the edge.
    const tolerance = 1e-9;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // A line is a "starter" if one of its endpoints is on or very near the left edge.
        const touchesLeft = line.x1 <= leftBoundary + tolerance || line.x2 <= leftBoundary + tolerance;
        // A line is a "finisher" if one of its endpoints is on or very near the right edge.
        const touchesRight = line.x1 >= rightBoundary - tolerance || line.x2 >= rightBoundary - tolerance;

        if (touchesLeft) {
            leftStarters.push(i);
        }
        if (touchesRight) {
            rightFinishers.add(i);
        }
    }

    if (leftStarters.length === 0 || rightFinishers.size === 0) {
        return { pathFound: false, path: [] };
    }

    const adj = new Map();
    for (let i = 0; i < lines.length; i++) {
        adj.set(i, []);
    }

    for (let i = 0; i < lines.length; i++) {
        for (let j = i + 1; j < lines.length; j++) {
            if (intersects(lines[i], lines[j])) {
                adj.get(i).push(j);
                adj.get(j).push(i);
            }
        }
    }

    const queue = [...leftStarters];
    const visited = new Set(leftStarters);
    const parent = new Map(); // To reconstruct the path

    while (queue.length > 0) {
        const currentIndex = queue.shift();

        if (rightFinishers.has(currentIndex)) {
            // --- Path Reconstruction ---
            const path = [];
            let current = currentIndex;
            while (current !== undefined) {
                path.unshift(current);
                current = parent.get(current);
            }
            return { pathFound: true, path: path }; // Bridge found!
        }

        const neighbors = adj.get(currentIndex);
        for (const neighborIndex of neighbors) {
            if (!visited.has(neighborIndex)) {
                visited.add(neighborIndex);
                parent.set(neighborIndex, currentIndex); // Set parent
                queue.push(neighborIndex);
            }
        }
    }

    return { pathFound: false, path: [] }; // No bridge found
}

// For Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { intersects, checkForBridge };
}
/**
 * Finds all connected components (clusters) in a set of lines.
 * @param {Array<object>} lines - An array of line objects.
 * @returns {Array<Array<number>>} - An array of clusters, where each cluster is an array of line indices.
 */
function findAllClusters(lines) {
    if (lines.length === 0) {
        return [];
    }

    const adj = new Map();
    for (let i = 0; i < lines.length; i++) {
        adj.set(i, []);
    }

    for (let i = 0; i < lines.length; i++) {
        for (let j = i + 1; j < lines.length; j++) {
            if (intersects(lines[i], lines[j])) {
                adj.get(i).push(j);
                adj.get(j).push(i);
            }
        }
    }

    const allClusters = [];
    const visited = new Set();

    for (let i = 0; i < lines.length; i++) {
        if (!visited.has(i)) {
            const currentCluster = [];
            const queue = [i];
            visited.add(i);

            while (queue.length > 0) {
                const u = queue.shift();
                currentCluster.push(u);

                const neighbors = adj.get(u);
                for (const v of neighbors) {
                    if (!visited.has(v)) {
                        visited.add(v);
                        queue.push(v);
                    }
                }
            }
            allClusters.push(currentCluster);
        }
    }

    return allClusters;
}

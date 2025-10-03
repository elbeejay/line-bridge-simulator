(function(global) {
    'use strict';

    // Module 4: Utility Modules

    class UnionFind {
        constructor() {
            this.parent = {};
            this.size = {};
            this.elementCount = 0;
        }

        add() {
            const elementId = this.elementCount;
            this.parent[elementId] = elementId;
            this.size[elementId] = 1;
            this.elementCount++;
        }

        find(i) {
            if (this.parent[i] === i) {
                return i;
            }
            this.parent[i] = this.find(this.parent[i]);
            return this.parent[i];
        }

        union(i, j) {
            const rootI = this.find(i);
            const rootJ = this.find(j);
            if (rootI !== rootJ) {
                if (this.size[rootI] < this.size[rootJ]) {
                    this.parent[rootI] = rootJ;
                    this.size[rootJ] += this.size[rootI];
                } else {
                    this.parent[rootJ] = rootI;
                    this.size[rootI] += this.size[rootJ];
                }
            }
        }
    }

    function intersects(lineA, lineB) {
        const p1 = { x: lineA.x1, y: lineA.y1 };
        const q1 = { x: lineA.x2, y: lineA.y2 };
        const p2 = { x: lineB.x1, y: lineB.y1 };
        const q2 = { x: lineB.x2, y: lineB.y2 };

        const o1 = orientation(p1, q1, p2);
        const o2 = orientation(p1, q1, q2);
        const o3 = orientation(p2, q2, p1);
        const o4 = orientation(p2, q2, q1);

        if (o1 !== o2 && o3 !== o4) return true;
        if (o1 === 0 && onSegment(p1, p2, q1)) return true;
        if (o2 === 0 && onSegment(p1, q2, q1)) return true;
        if (o3 === 0 && onSegment(p2, p1, q2)) return true;
        if (o4 === 0 && onSegment(p2, q1, q2)) return true;
        return false;
    }

    function orientation(p, q, r) {
        const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
        if (val === 0) return 0;
        return (val > 0) ? 1 : 2;
    }

    function onSegment(p, q, r) {
        return (
            q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
            q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)
        );
    }

    // --- Module Export ---
    if (typeof module !== 'undefined' && module.exports) {
        // Node.js
        module.exports = { intersects, UnionFind };
    } else {
        // Browser
        global.UnionFind = UnionFind;
        global.intersects = intersects;
    }

})(typeof window !== 'undefined' ? window : this);
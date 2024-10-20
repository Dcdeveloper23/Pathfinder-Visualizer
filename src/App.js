import React, { useEffect, useState } from "react";
import "./App.css";

const NUM_ROWS = 20;
const NUM_COLS = 50;

function App() {
  const [grid, setGrid] = useState([]);
  const [isMousePressed, setIsMousePressed] = useState(false);
  const [startNode, setStartNode] = useState({ row: 10, col: 15 });
  const [endNode, setEndNode] = useState({ row: 10, col: 35 });
  const [movingStart, setMovingStart] = useState(false);
  const [movingEnd, setMovingEnd] = useState(false);

  useEffect(() => {
    const newGrid = createGrid(startNode, endNode);
    setGrid(newGrid);
  }, [startNode, endNode]);

  const handleMouseDown = (row, col) => {
    if (row === startNode.row && col === startNode.col) {
      setMovingStart(true);
    } else if (row === endNode.row && col === endNode.col) {
      setMovingEnd(true);
    } else {
      const newGrid = getNewGridWithWallToggled(grid, row, col);
      setGrid(newGrid);
    }
    setIsMousePressed(true);
  };

  const handleMouseEnter = (row, col) => {
    if (!isMousePressed) return;
    if (movingStart) {
      setStartNode({ row, col });
    } else if (movingEnd) {
      setEndNode({ row, col });
    } else {
      const newGrid = getNewGridWithWallToggled(grid, row, col);
      setGrid(newGrid);
    }
  };

  const handleMouseUp = () => {
    setIsMousePressed(false);
    setMovingStart(false);
    setMovingEnd(false);
  };

  const visualizeAStar = () => {
    const start = grid[startNode.row][startNode.col];
    const end = grid[endNode.row][endNode.col];
    const visitedNodesInOrder = aStar(start, end, grid);
    const nodesInShortestPathOrder = reconstructPath(end);
    animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
  };

  const resetGrid = () => {
    setStartNode({ row: 10, col: 15 });
    setEndNode({ row: 10, col: 35 });
    const newGrid = createGrid({ row: 10, col: 15 }, { row: 10, col: 35 });
    setGrid(newGrid);
  };

  return (
    <>
      <button onClick={visualizeAStar}>Visualize A*</button>
      <button onClick={resetGrid}>Reset</button>
      <div className="grid">
        {grid.map((row, rowIdx) => {
          return (
            <div key={rowIdx} className="grid-row">
              {row.map((node, nodeIdx) => {
                const { isStart, isEnd, isWall } = node;
                const extraClassName = isStart
                  ? "node-start"
                  : isEnd
                  ? "node-end"
                  : isWall
                  ? "node-wall"
                  : "";
                return (
                  <div
                    key={nodeIdx}
                    id={`node-${node.row}-${node.col}`}
                    className={`node ${extraClassName}`}
                    onMouseDown={() => handleMouseDown(node.row, node.col)}
                    onMouseEnter={() => handleMouseEnter(node.row, node.col)}
                    onMouseUp={handleMouseUp}
                  ></div>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}

// A* algorithm and helper functions remain the same
function aStar(startNode, endNode, grid) {
  const openSet = [startNode];
  const visitedNodesInOrder = [];
  startNode.g = 0;
  startNode.f = heuristic(startNode, endNode);

  while (openSet.length) {
    openSet.sort((nodeA, nodeB) => nodeA.f - nodeB.f);
    const currentNode = openSet.shift();
    visitedNodesInOrder.push(currentNode);

    if (currentNode === endNode) return visitedNodesInOrder;

    const neighbors = getNeighbors(currentNode, grid);
    for (const neighbor of neighbors) {
      const tentativeGScore = currentNode.g + 1;
      if (tentativeGScore < neighbor.g) {
        neighbor.g = tentativeGScore;
        neighbor.f = neighbor.g + heuristic(neighbor, endNode);
        neighbor.previousNode = currentNode;

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }
  return visitedNodesInOrder;
}

function reconstructPath(endNode) {
  const nodesInPath = [];
  let currentNode = endNode;
  while (currentNode !== null) {
    nodesInPath.push(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInPath;
}

function heuristic(nodeA, nodeB) {
  const d1 = Math.abs(nodeA.row - nodeB.row);
  const d2 = Math.abs(nodeA.col - nodeB.col);
  return d1 + d2;
}

function getNeighbors(node, grid) {
  const neighbors = [];
  const { row, col } = node;

  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);

  return neighbors.filter((neighbor) => !neighbor.isWall);
}

function createGrid(startNode, endNode) {
  const grid = [];
  for (let row = 0; row < NUM_ROWS; row++) {
    const currentRow = [];
    for (let col = 0; col < NUM_COLS; col++) {
      currentRow.push(createNode(row, col, startNode, endNode));
    }
    grid.push(currentRow);
  }
  return grid;
}

function createNode(row, col, startNode, endNode) {
  return {
    row,
    col,
    isStart: row === startNode.row && col === startNode.col,
    isEnd: row === endNode.row && col === endNode.col,
    g: Infinity,
    f: Infinity,
    isWall: false,
    previousNode: null,
  };
}

function getNewGridWithWallToggled(grid, row, col) {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
}

function animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder) {
  for (let i = 0; i < visitedNodesInOrder.length; i++) {
    setTimeout(() => {
      const node = visitedNodesInOrder[i];
      document.getElementById(`node-${node.row}-${node.col}`).className =
        "node node-visited";
    }, 10 * i);
  }

  setTimeout(() => {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-shortest-path";
      }, 50 * i);
    }
  }, 10 * visitedNodesInOrder.length);
}

export default App;

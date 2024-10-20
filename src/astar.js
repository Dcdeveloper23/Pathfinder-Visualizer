export function aStar(grid, startNode, endNode) {
  const openSet = [startNode];
  const closedSet = [];
  startNode.g = 0;
  startNode.f = heuristic(startNode, endNode);

  while (openSet.length > 0) {
    let current = openSet.shift();
    closedSet.push(current);

    if (current === endNode) {
      return reconstructPath(endNode);
    }

    current.neighbors.forEach((neighbor) => {
      if (!closedSet.includes(neighbor) && !neighbor.isWall) {
        const tempG = current.g + 1;
        if (!openSet.includes(neighbor)) {
          neighbor.g = tempG;
          neighbor.f = neighbor.g + heuristic(neighbor, endNode);
          openSet.push(neighbor);
        }
      }
    });
  }

  return [];
}

function heuristic(node, endNode) {
  return Math.abs(node.row - endNode.row) + Math.abs(node.col - endNode.col);
}

function reconstructPath(endNode) {
  const path = [];
  let current = endNode;
  while (current != null) {
    path.push(current);
    current = current.previousNode;
  }
  return path;
}

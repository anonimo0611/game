// https://github.com/siberex/astar-pacman
export const Astar = new class {
	Graph(grid) {
		return new Graph(grid);
	}
	search(grid, start, end, heuristic=Astar.#manhattan) {
		if (!grid || !start || !end) return [];
		Astar.#init(grid);
		const openHeap = new BinaryHeap(node=> node.f);

		openHeap.push(start);
		while (openHeap.size > 0) {
			const currentNode = openHeap.pop();
			if (currentNode === end) {
				const ret = [];
				let curr = currentNode;
				while (curr.parent) {
					ret.push(curr);
					curr = curr.parent;
				}
				return ret.reverse();
			}
			currentNode.closed = true;

			for (const neighbor of Astar.#neighbors(grid, currentNode)) {
				if (neighbor.closed || neighbor.isWall()) continue;
				const gScore = currentNode.g + 1;
				const beenVisited = neighbor.visited;
				if (!beenVisited || gScore < neighbor.g) {
					neighbor.visited = true;
					neighbor.parent = currentNode;
					neighbor.h = neighbor.h || heuristic(neighbor.pos, end.pos);
					neighbor.g = gScore;
					neighbor.f = neighbor.g + neighbor.h;
					!beenVisited
						? openHeap.push(neighbor)
						: openHeap.rescoreElement(neighbor);
				}
			}
		}
		return [];
	}
	#init(grid) {
		for (let x=0, xl=grid.length; x<xl; x++) {
			for (let y=0, yl=grid[x].length; y<yl; y++) {
				const node = grid[x][y];
				node.f = node.g = node.h = 0;
				node.visited = node.closed = false;
				node.parent  = null;
			}
		}
	}
	#manhattan(pos0, pos1) {
		let d1 = pos1.x - pos0.x; if (d1 < 0) d1 = -d1;
		let d2 = pos1.y - pos0.y; if (d2 < 0) d2 = -d2;
		return d1 + d2;
	}
	#neighbors(grid, {x,y}) {
		const ret = [];
		if (grid[x-1] && grid[x-1][y]) ret.push(grid[x-1][y]);
		if (grid[x+1] && grid[x+1][y]) ret.push(grid[x+1][y]);
		if (grid[x] && grid[x][y-1])   ret.push(grid[x][y-1]);
		if (grid[x] && grid[x][y+1])   ret.push(grid[x][y+1]);
		return ret;
	}
};

const GraphNodeType =
	Object.freeze({OPEN:0, WALL:1});

class Graph {
	constructor(grid) {
		this.elements = grid;
		this.nodes = [];
		grid.forEach((row, x)=> {
			this.nodes[x] = [];
			row.forEach((data, y)=>
				this.nodes[x].push(new GraphNode(x, y, data)));
		});
	}
}
class GraphNode {
	constructor(x,y,type) {
		this.data = {};
		this.x = x;
		this.y = y;
		this.pos = {x, y};
		this.type = type;
	}
	isWall() {
		return this.type == GraphNodeType.WALL;
	}
}
class BinaryHeap {
	constructor(scoreFunction) {
		this.content = [];
		this.scoreFunction = scoreFunction;
	}
	push(element) {
		this.content.push(element);
		this.sinkDown(this.content.length - 1);
	}
	pop() {
		const result = this.content[0];
		const end = this.content.pop();
		if (this.content.length > 0) {
			this.content[0] = end;
			this.bubbleUp(0);
		}
		return result;
	}
	remove(node) {
		const i   = this.content.indexOf(node);
		const end = this.content.pop();
		if (i != this.content.length - 1) {
			this.content[i] = end;
			this.scoreFunction(end) < this.scoreFunction(node)
				? this.sinkDown(i)
				: this.bubbleUp(i);
		}
	}
	get size() {
		return this.content.length;
	}
	rescoreElement(node) {
		this.sinkDown(this.content.indexOf(node));
	}
	sinkDown(n) {
		const element = this.content[n];
		while (n > 0) {
			const parentN = ((n+1) >> 1) - 1;
			const parent = this.content[parentN];
			if (this.scoreFunction(element) < this.scoreFunction(parent)) {
				this.content[parentN] = element;
				this.content[n] = parent;
				n = parentN;
			}
			else break;
		}
	}
	bubbleUp(n) {
		const length    = this.content.length;
		const element   = this.content[n];
		const elemScore = this.scoreFunction(element);
		while(true) {
			const child2N = (n+1) << 1, child1N = child2N - 1;
			let swap = null;
			let child1,child1Score,child2,child2Score;
			if (child1N < length) {
				child1      = this.content[child1N];
				child1Score = this.scoreFunction(child1);
				if (child1Score < elemScore)
					swap = child1N;
			}
			if (child2N < length) {
				child2      = this.content[child2N];
				child2Score = this.scoreFunction(child2);
				if (child2Score < (swap == null ? elemScore : child1Score))
					swap = child2N;
			}
			if (swap != null) {
				this.content[n] = this.content[swap];
				this.content[swap] = element;
				n = swap;
			}
			else break;
		}
	}
}
import {Vec2} from './_lib/vec2.js';
import {Rect} from './_lib/rect.js';
import {Ctx}  from './_main.js';

export const TileType = deepFreeze({
	None:0, Wall:1, Pow:2, Ghosts:range(3,6)});

function generateMap(G, H) {
	const [NONE,WALL,POW,GHOSTS]= values(TileType);
	const g = integers(G).map(_=> integers(G).fill(NONE));

	// Default walls
	const fillWall = ({x, y})=> g[y][x] = WALL;
	Rect.surround(Vec2(H,H),  2).map(fillWall);
	Rect.surround(Vec2(H,H),H-1).map(fillWall);

	// Power dots
	g[4][4] = g[4][G-5] = g[G-5][4] = g[G-5][G-5] = POW;

	// Ghosts
	[[0,-3], [0,0], [-1,0], [1,0]]
		.forEach(([x,y], idx)=> g[H+y][H+x] = GHOSTS[idx]);

	// Side tunnel
	for (let i of integers(3))
		g[H+i][i%2] = g[H+i][G-(i%2+1)] = [WALL,NONE][i%2];

	return freeze(g.flat());
}
export function updateMap(idx=0) {
	const GRID = [23,27,31][idx];
	const T = [920,972,992][idx]/GRID; // Tile size
	const THICKNESS = [14,12,12][idx]; // Wall thickness
	entries({
		MAZE_IDX: idx, THICKNESS,
		GRID,T,A: int(T * 1.70), // Actor size
		CVS_SIZE: int(T * GRID), // Canvas size
		FOOTER_H: int(T+(T-THICKNESS)/2),
		MAP_DATA: generateMap(GRID, GRID>>1),
	})
	.forEach(([k,v])=> setReadonlyProp(globalThis,k,v));
	dRoot.css('--tileSize',T+'px');
	dRoot.css('--cvsSize', CVS_SIZE+'px');
	setCanvasSize('obCvs')(CVS_SIZE);
	setCanvasSize('bgCvs')(CVS_SIZE);
	setCanvasSize('speakerCvs')(T*1.2);
	localStorage.randPacSize = idx;
	return $trigger('resize');
}
{ // Set the exclamation-mark offset
	const f = $(dRoot).css('--messageFont');
	const o = measureTextWidth('!', f) / 2;
	dRoot.css('--excl-offset', o+'px');
}
const sizeParam = paramFromCurrentURL('size');
updateMap((sizeParam ?? localStorage.randPacSize) || 0);
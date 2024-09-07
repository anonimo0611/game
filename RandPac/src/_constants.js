import {Vec2} from './_lib/vec2.js';
import {Rect} from './_lib/rect.js';
import {Ctx}  from './_main.js';

export const TileType = deepFreeze({
	None:0, Wall:1, Pow:2, Ghosts:range(3,6)
});
export function updateMap(idx=0) {
	const GRID = [23,27,31][idx];      // Grid size
	const THICKNESS = [14,12,12][idx]; // Wall thickness
	const T = [920,972,992][idx]/GRID; // Tile size
	const A = int(T*1.7);              // Actor size

	entries({ // Setting global constants
		GRID,T,A,THICKNESS,
		MAZE_IDX: idx,
		CVS_SIZE: int(T*GRID),            // Canvas size
		FOOTER_H: int(T+(T-THICKNESS)/2), // Footer height
		MAP_DATA: generateMap(GRID),
	})
	.forEach(([k, v])=> setReadonlyProp(globalThis, k, v));

	localStorage.randPacSize = idx;
	dRoot.css('--tileSize',T+'px');
	dRoot.css('--cvsSize', CVS_SIZE+'px');
	setCanvasSize('obCvs')(CVS_SIZE);
	setCanvasSize('bgCvs')(CVS_SIZE);
	setCanvasSize('speakerCvs')(T*1.2);
	return $trigger('resize');
}
function generateMap(gridSize) {
	const G = gridSize, H = G>>1;
	const [NONE,WALL,POW,GHOSTS]= values(TileType);
	const map = integers(G).map(_=> integers(G).fill(NONE));

	// Default walls
	const fillWall = ({x, y})=> map[y][x] = WALL;
	Rect.surround(Vec2(H,H),  2).map(fillWall);
	Rect.surround(Vec2(H,H),H-1).map(fillWall);

	// Power dots
	map[4][4] = map[4][G-5] = map[G-5][4] = map[G-5][G-5] = POW;

	// Ghosts
	[[0,-3], [0,0], [-1,0], [1,0]]
		.forEach(([x,y], idx)=> map[H+y][H+x] = GHOSTS[idx]);

	// Side tunnel
	for (let i of integers(3))
		map[H+i][i%2] = map[H+i][G-(i%2+1)] = [WALL,NONE][i%2];

	return freeze( map.flat() );
}
{ // Set the exclamation-mark offset
	const font   = $(dRoot).css('--messageFont');
	const offset = measureTextWidth('!', font) / 2;
	dRoot.css('--excl-offset', offset+'px');
}
updateMap(paramFromCurrentURL('size') ?? localStorage.randPacSize);
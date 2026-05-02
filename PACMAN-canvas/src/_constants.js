const
COLS      = 28,
ROWS      = 34,
DOT_PTS   = 10,
POW_PTS   = 50,
TILE_SIZE = int(screen.height/ROWS),

/** Scale Factor */
SF = screen.height/1080,

/** Shorthand of TILE_SIZE */
T = TILE_SIZE,

/** Board width */
BW = COLS*TILE_SIZE,

/** Board height */
BH = ROWS*TILE_SIZE,

Dazed = 'Dazed',
U='Up', R='Right', D='Down', L='Left',

Bg   = canvas2D('board_bg'  , BW,BH).ctx,
Fg   = canvas2D('board_main', BW,BH).ctx,
HUD  = canvas2D('board_hud' , BW,BH).ctx,
Grid = canvas2D('board_grid', BW,BH).ctx,

PointType = freeze({
	Fruit: 0,
	Ghost: 1,
}),
GhostType = freeze({
	Akabei: 0,
	Pinky:  1,
	Aosuke: 2,
	Guzuta: 3,
	Max:    4,
}),
Color = /**@type {const}*/({
	GridLine:   '#F00',
	Cookie:     '#FFB8AE',
	HouseDoor:  '#FFB8DE',
	ExtendLife: '#F55',
	NoticeTxt:  '#F90',
	Pacman:     '#FF0',
	GhostEye:   '#33F',
	GhostSkin:  '#F4BEB0',
	GhostBodies: [
		'#E00', // Akabei
		'#F9B', // Pinky
		'#0CF', // Aosuke
		'#FB0', // Guzuta
		'#36A','#FFF' // Frightened
	],
	FrightFaces: ['#F9F','#F00'], // normal, flashed
	MazeWalls:   ['#58E','#FFF'], // normal, flashed
	InfoTexts:   ['#888','#F9E'], // disabled, enabled
	PointTexts:  ['#FAF','#3CF'], // fruit, ghost
})

// Use the tile size as the default font size
$root.css('--tile-size',`${TILE_SIZE}px`)
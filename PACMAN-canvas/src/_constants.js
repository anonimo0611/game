const
Cols     = 28,
Rows     = 34,
DotPts   = 10,
PowPts   = 50,
TileSize = int(screen.height/Rows),

/** Shorthand of TileSize */
T = TileSize,

/** Board width */
BW = Cols*TileSize,

/** Board height */
BH = Rows*TileSize,

DazedEyes = 'DazedEyes',
U='Up', R='Right', D='Down', L='Left',

Bg   = canvas2D('board_bg'  , BW,BH).ctx,
Fg   = canvas2D('board_main', BW,BH).ctx,
HUD  = canvas2D('board_hud' , BW,BH).ctx,
Grid = canvas2D('board_grid', BW,BH).ctx,

GhostType = /**@type {const}*/({
	Akabei:0, Pinky:1, Aosuke:2, Guzuta:3, Max:4
}),
Color = /**@type {const}*/({
	Grid:      '#F00',
	Dot:       '#FFB8AE',
	Door:      '#FFB8DE',
	Extend:    '#F55',
	Notice:    '#F90',
	Pacman:    '#FF0',
	GhostEye:  '#33F',
	GhostSkin: '#F4BEB0',
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
$root.css('--tile-size',`${TileSize}px`)
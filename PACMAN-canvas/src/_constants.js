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

GhostType = /**@type {const}*/(
	{Akabei:0,Pinky:1,Aosuke:2,Guzuta:3,Max:4}
),
Color = /**@type {const}*/({
	Grid:      '#F00',
	Dot:       '#FFB8AE',
	Door:      '#FFB8DE',
	Extend:    '#F55',
	Notice:    '#F90',
	Pacman:    '#FF0',
	GhostEyes: '#33F',
	GhostSkin: '#F4BEB0',
}),
Palette = /**@type {const}*/({
	MazeWall:   ['#58E','#FFF'],
	InfoText:   ['#888','#F9E'], // disabled, enabled
	PointText:  ['#FAF','#3CF'], // fruit, ghost
	Ghosts:     ['#E00','#F9B','#0CF','#FB0'],
	FrightFace: ['#F9F','#F00'],
	FrightBody: ['#36A','#FFF'],
})

// Use the tile size as the default font size
$root.css('--tile-size',`${TileSize}px`)
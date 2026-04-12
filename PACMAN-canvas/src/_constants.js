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

Color = /**@type {const}*/({
	Grid:      '#F00',
	Dot:       '#FFB8AE',
	Door:      '#FFB8DE',
	Pacman:    '#FF0',
	Akabei:    '#E00',
	Pinky:     '#F9B',
	Aosuke:    '#0CF',
	Guzuta:    '#FB0',
	GhostEyes: '#33F',
	GhostSkin: '#F4BEB0',
	Extend:    '#F55',
	Orange:    '#F90',
}),
Palette = /**@type {const}*/({
	Info:       ['#888','#F9E'], // disabled, enabled
	Points:     ['#FAF','#3CF'], // fruit, ghost
	Wall:       ['#58E','#FFF'],
	FrightFace: ['#F9F','#F00'],
	FrightBody: ['#36A','#FFF'],
}),

GhostType   = /**@type {const}*/({Akabei:0,Pinky:1,Aosuke:2,Guzuta:3,Max:4}),
GhostNames  = /**@type {const}*/(['Akabei','Pinky','Aosuke','Guzuta']),
GhostColors = /**@type {readonly string[]}*/(GhostNames.map(n=> Color[n]))

// Use the tile size as the default font size
$root.css('--tile-size', `${TileSize}px`)
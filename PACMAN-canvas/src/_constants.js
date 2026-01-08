const
TileSize  = 31,
Cols      = 28,
Rows      = 34,
DotPts    = 10,
PowPts    = 50,
BaseSpeed = TileSize/4.5,

/** Shorthand of TileSize */
T = TileSize,

/** Board width */
BW = Cols * T,

/** Board height */
BH = Rows * T,

/** @typedef {'Up'|'Right'|'Down'|'Left'} Direction */
U='Up', R='Right', D='Down', L='Left',

Bg  = canvas2D('board_bg' ,  BW,BH).ctx,
HUD = canvas2D('board_hud',  BW,BH).ctx,
Ctx = canvas2D('board_main', BW,BH).ctx,

Colors = freeze(new class {
	Grid      = '#F00'
	Dot       = '#FFB8AE'
	Wall      = '#58E'
	FlashWall = '#FFF'
	Door      = '#FFB8DE'
	Pacman    = '#FF0'
	Akabei    = '#E00'
	Pinky     = '#F9B'
	Aosuke    = '#0CF'
	Guzuta    = '#FB0'
	GhostEyes = '#33F'
	GhostSkin = '#F4BEB0'
	GhostPts  = '#3CF'
	FruitPts  = '#FFB8FF'
	Extend    = '#F55'
	Orange    = '#F90'
}),
Palette = /**@type {const}*/({
	Info      : ['#888','#F9E'],
	FrightFace: ['#F9F','#F00'],
	FrightBody: ['#36A','#FFF'],
}),
PacScale  = 0.9,
PacRadius = PacScale*T,
PacSpeed  = freeze(new class {
	SlowLevel = 13   // After this level, Pacman slows down
	SlowRate  = 0.98 // Deceleration rate at SlowLevel
	Base      = BaseSpeed
	Eating    = this.Base * 0.86
	Energized = this.Base * 1.10
	EneEating = this.Base * 0.95 // Energized+Eating
}),
GhsScale =  1.1,
GhsType   = /**@type {const}*/({Akabei:0,Pinky:1,Aosuke:2,Guzuta:3,Max:4}),
GhsNames  = /**@type {const}*/(['Akabei','Pinky','Aosuke','Guzuta']),
GhsColors = GhsNames.map(name=> Colors[name]),
GhsSpeed  = freeze(new class {
	Base     = BaseSpeed * 1.07
	Idle     = this.Base * 0.50
	GoOut    = this.Base * 0.50
	Fright   = this.Base * 0.60
	InTunnel = this.Base * 0.60
	Escape   = this.Base * 1.40
})
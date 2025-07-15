const
Rows     = 34,
Cols     = 28,
TileSize = 26,
DotScore = 10,
PowScore = 50,
MoveStep = TileSize/4.5,

/** Shorthand of TileSize */
T = TileSize,

/** Blinking interval in frames */
PowDotInterval = 15,

/** @typedef {'Up'|'Right'|'Down'|'Left'} Direction */
U='Up', R='Right', D='Down', L='Left',

/** The document body */
dBody = document.body,

/** Board width */
BW = T*Cols,
/** Board height */
BH = T*Rows,

Bg  = canvas2D('board_bg' ,  BW,BH),
HUD = canvas2D('board_hud',  BW,BH),
Ctx = canvas2D('board_main', BW,BH).ctx,

Color = freeze(new class {
	Grid      = '#FF0000'
	Dot       = '#FFB8AE'
	Wall      = '#5588EE'
	FlashWall = '#FFFFFF'
	Door      = '#FFB8DE'
	Pacman    = '#FFFF00'
	PacCenter = '#FF0000'
	Akabei    = '#EE0000'
	Pinky     = '#FF99BB'
	Aosuke    = '#00CCFF'
	Guzuta    = '#FFBB00'
	GhostEyes = '#3333FF'
	GhostSkin = '#F4BEB0'
	GhostPts  = '#33CCFF'
	FruitPts  = '#FFB8FF'
	Extend    = '#FF5555'
	Message1  = '#00FFFF'
	Message2  = '#FFFF00'
	Message3  = '#FF0000'
	BonusText = '#FF9900'
	InfoTable       = freeze(['#888888','#FF99EE'])
	FrightBodyTable = freeze(['#3366AA','#FFFFFF'])
	FrightFaceTable = freeze(['#FF99FF','#FF0000'])
}),

PacScale  = 0.9,
PacRadius = T*PacScale,
PacStep   = freeze(new class {
	SlowLevel = 13   // After this level, Pacman slows down
	SlowRate  = 0.98 // Deceleration rate at SlowLevel
	Base      = MoveStep
	Eating    = this.Base * 0.86
	Energized = this.Base * 1.10
	EneEat    = this.Base * 0.95 // Energized+Eating
}),

GhsScale = 1.1,
GhsType  = /**@type {const}*/({Akabei:0,Pinky:1,Aosuke:2,Guzuta:3,Max:4}),
GhsNames = /**@type {const}*/(['Akabei','Pinky','Aosuke','Guzuta']),
GhsStep  = freeze(new class {
	Base     = MoveStep  * 1.07
	Idle     = this.Base * 0.50
	GoOut    = this.Base * 0.50
	Fright   = this.Base * 0.60
	InTunnel = this.Base * 0.60
	Escape   = this.Base * 1.40
})
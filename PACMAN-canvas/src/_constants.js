const
Rows     = 34,
Cols     = 28,
TileSize = 27,
DotPts   = 10,
PowPts   = 50,

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
	Inf          = freeze(['#888','#F9E'])
	FrightFaces  = freeze(['#F9F','#F00'])
	FrightBodies = freeze(['#36A','#FFF'])
}),

BaseSpeed    = TileSize /4.5,
GhsBaseSpeed = BaseSpeed*1.07,

PacScale  = 0.9,
PacRadius = T*PacScale,
PacSpeed  = freeze({
	SlowLevel: 13,   // After this level, Pacman slows down
	SlowRate:  0.98, // Deceleration rate at SlowLevel
	Base:      BaseSpeed,
	Eating:    BaseSpeed * 0.86,
	Energized: BaseSpeed * 1.10,
	EneEat :   BaseSpeed * 0.95, // Energized+Eating
}),
GhsScale = 1.1,
GhsType  = /**@type {const}*/({Akabei:0,Pinky:1,Aosuke:2,Guzuta:3,Max:4}),
GhsNames = /**@type {const}*/(['Akabei','Pinky','Aosuke','Guzuta']),
GhsSpeed = freeze({
	Base:     GhsBaseSpeed,
	Idle:     GhsBaseSpeed * 0.50,
	GoOut:    GhsBaseSpeed * 0.50,
	Fright:   GhsBaseSpeed * 0.60,
	InTunnel: GhsBaseSpeed * 0.60,
	Escape:   GhsBaseSpeed * 1.40,
})
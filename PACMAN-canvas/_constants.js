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

[Bg,HUD,,Ctx,CW,CH]= [
	canvas2D('cvs_bg' ,  T*Cols, T*Rows),
	canvas2D('cvs_hud',  T*Cols, T*Rows),...
	canvas2D('cvs_main', T*Cols, T*Rows).vals
],

Color = freeze(new class {
	Grid      = '#F00'
	Dot       = '#FFB8AE'
	Wall      = '#58E'
	FlashWall = '#FFF'
	Door      = '#FFB8DE'
	Pacman    = '#FF0'
	PacCenter = '#F00'
	Akabei    = '#E00'
	Pinky     = '#F9B'
	Aosuke    = '#0CF'
	Guzuta    = '#FB0'
	GhostEyes = '#33F'
	GhostSkin = '#F4BEB0'
	GhostPts  = '#3CF'
	FruitPts  = '#FFB8FF'
	Extend    = '#F55'
	Message1  = '#0FF'
	Message2  = '#FF0'
	Message3  = '#F00'
	BonusText = '#F90'
	InfoTable       = freeze(['#888','#F9E'])
	FrightBodyTable = freeze(['#36A','#FFF'])
	FrightFaceTable = freeze(['#F9F','#F00'])
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
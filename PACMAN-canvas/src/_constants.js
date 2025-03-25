const Cols = 28
const Rows = 34
const TileSize = +$(dRoot).css('--tile-size'), T=TileSize
const BaseStep = +(TileSize/4.5).toFixed(1)

const [Bg,,Ctx,CvsW,CvsH]= [
	canvas2D(null , TileSize*Cols, TileSize*Rows),...
	canvas2D('cvs', TileSize*Cols, TileSize*Rows).vals
]
const Color = freeze(new class {
	Grid      = '#F00'
	Dot       = '#FFB8AE'
	Wall      = '#55E'
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
	Message1  = '#0FF'
	Message2  = '#FF0'
	Message3  = '#F00'
	InfoTable       = freeze(['#888','#F9E'])
	FrightBodyTable = freeze(['#36A','#FFF'])
	FrightFaceTable = freeze(['#F9F','#F00'])
})

const PacScale  = 0.9
const PacRadius = TileSize*PacScale
const PacStep   = freeze(new class {
	Base     = BaseStep
	SlowBase = 0.98
	Eating   = this.Base * 0.86
	EneEat   = this.Base * 0.95
	Energize = this.Base * 1.10
})

const GhsScale = 1.1
const GhsType  = freeze({Akabei:0,Pinky:1,Aosuke:2,Guzuta:3,Max:4})
const GhsNames = freeze(keys(GhsType).slice(0,-1))
const GhsStep  = freeze(new class {
	Base     = BaseStep  * 1.07
	Idle     = this.Base * 0.50
	GoOut    = this.Base * 0.50
	Fright   = this.Base * 0.60
	InTunnel = this.Base * 0.60
	Escape   = this.Base * 1.40
	Return   = this.Escape
})
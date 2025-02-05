import {Cols,Rows} from './_map_data.js'
export * from './_map_data.js'
export const PacScale  = 0.9
export const GhsScale  = 1.1
export const TileSize  = +$(dRoot).css('--tile-size')
export const PacRadius = TileSize * PacScale
export const GhsType   = freeze({Akabei:0,Pinky:1,Aosuke:2,Guzuta:3,Max:4})
export const GhsNames  = freeze(keys(GhsType).slice(0,-1))

export const [Bg,Cvs,Ctx,CvsW,CvsH] =
	[canvas2D(null ,TileSize*Cols,TileSize*Rows),...
	 canvas2D('cvs',TileSize*Cols,TileSize*Rows).vals]

const BaseStep = +(TileSize/4.5).toFixed(1)
export const PacStep = freeze(new class {
	Base     = BaseStep
	SlowBase = 0.98
	Eating   = this.Base * 0.86
	EneEat   = this.Base * 0.95
	Energize = this.Base * 1.10
})
export const GhsStep = freeze(new class {
	Base     = BaseStep  * 1.07
	Idle     = this.Base * 0.50
	GoOut    = this.Base * 0.50
	Fright   = this.Base * 0.60
	InTunnel = this.Base * 0.60
	Escape   = this.Base * 1.40
	Return   = this.Escape
})
export const Color = freeze(new class {
	Grid      = '#F00'
	Dot       = '#FFB8AE'
	Wall      = '#55E'
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
	Message1  = '#0FF'
	Message2  = '#FF0'
	Message3  = '#F00'
	InfoList       = freeze(['#888','#F9E'])
	FrightBodyList = freeze(['#36A','#FFF'])
	FrightFaceList = freeze(['#F9F','#F00'])
})
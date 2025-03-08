const Cols = 28
const Rows = 34
const PacScale  = 0.9
const GhsScale  = 1.1
const TileSize  = +$(dRoot).css('--tile-size'), T = TileSize
const BaseStep  = +(T/4.5).toFixed(1)
const PacRadius = TileSize * PacScale
const GhsType   = freeze({Akabei:0,Pinky:1,Aosuke:2,Guzuta:3,Max:4})
const GhsNames  = freeze(keys(GhsType).slice(0,-1))

const [Bg,Cvs,Ctx,CvsW,CvsH]= [
	canvas2D(null ,T*Cols,T*Rows),...
	canvas2D('cvs',T*Cols,T*Rows).vals
],
PacStep = freeze({
	Base:     BaseStep,
	SlowBase: 0.98,
	Eating:   this.Base * 0.86,
	EneEat:   this.Base * 0.95,
	Energize: this.Base * 1.10,
}),
GhsStep = freeze({
	Base:     BaseStep  * 1.07,
	Idle:     this.Base * 0.50,
	GoOut:    this.Base * 0.50,
	Fright:   this.Base * 0.60,
	InTunnel: this.Base * 0.60,
	Escape:   this.Base * 1.40,
	Return:   this.Escape,
}),
Color = freeze({
	Grid:      '#F00',
	Dot:       '#FFB8AE',
	Wall:      '#55E',
	Door:      '#FFB8DE',
	Pacman:    '#FF0',
	Akabei:    '#E00',
	Pinky:     '#F9B',
	Aosuke:    '#0CF',
	Guzuta:    '#FB0',
	GhostEyes: '#33F',
	GhostSkin: '#F4BEB0',
	GhostPts:  '#3CF',
	FruitPts:  '#FFB8FF',
	Message1:  '#0FF',
	Message2:  '#FF0',
	Message3:  '#F00',
	InfoTable:       freeze(['#888','#F9E']),
	FrightBodyTable: freeze(['#36A','#FFF']),
	FrightFaceTable: freeze(['#F9F','#F00']),
})
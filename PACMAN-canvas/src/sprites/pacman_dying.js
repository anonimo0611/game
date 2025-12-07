const PacR    = PacRadius
const DisDur  = 1149/Ticker.Interval
const LineDur =  300/Ticker.Interval
const FadeDur =  300/Ticker.Interval

export class Dying {
	#mAngle = 0
	#alpha  = 1
	#innerR = PacR/4
	#outerR = PacR/2

	/** @readonly */ctx
	constructor(ctx=Ctx) {this.ctx = ctx}
	draw({x=0,y=0}={}) {
		const {ctx}= this
		ctx.save()
		ctx.translate(x,y)
		ctx.lineWidth = T/6
		ctx.fillStyle = ctx.strokeStyle = Colors.Pacman
		this.#mAngle < PI - PI/DisDur
 			? this.#disappear()
	 		: this.#drawRadialLines()
		ctx.restore()
	}
	#disappear() {
		const {ctx}= this
		this.#mAngle += PI/DisDur
		ctx.beginPath()
		ctx.moveTo(0, PacR*0.3)
		ctx.arc(0, 0, PacR, -PI/2+this.#mAngle, -PI/2-this.#mAngle)
		ctx.fill()
	}
	#drawRadialLines() {
		const {ctx}= this
		const innerR = min(this.#innerR += PacR/2/LineDur, PacR/2)
		const outerR = min(this.#outerR += PacR/1/LineDur, PacR/1)
		if (this.#outerR >= PacR)
			ctx.globalAlpha = max(this.#alpha -= 1/FadeDur, 0)
		for (const deg of range(0, 360, 360/10)) {
			ctx.beginPath()
	 		ctx.moveTo(...circumPosition(deg, innerR))
	     	ctx.lineTo(...circumPosition(deg, outerR))
	     	ctx.stroke()
		}
	}
}
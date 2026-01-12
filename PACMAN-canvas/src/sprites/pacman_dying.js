const PacR    = PacRadius
const DisDur  = 1149/Ticker.Interval
const LineDur =  300/Ticker.Interval

export class Dying {
	#arkAng  = 0
	#innerR  = PacR/4
	#outerR  = PacR/2
	#fadeOut = Fade.out(300)

	/** @readonly */ctx
	constructor(ctx=Ctx) {this.ctx = ctx}
	get isSplitting() {
		return this.#arkAng < PI-PI/DisDur
	}
	update() {
		this.isSplitting
			? this.#arkAng += PI/DisDur
			: this.#updateRadialBurst()
	}
	#updateRadialBurst() {
		if (this.#outerR <= PacR) {
			this.#innerR += PacR/2/LineDur
			this.#outerR += PacR/1/LineDur
			return
		}
		this.#fadeOut.update()
	}
	draw({x=0,y=0}={}) {
		const {ctx}= this
		ctx.save()
		ctx.translate(x,y)
		ctx.lineWidth = T/6
		ctx.fillStyle = ctx.strokeStyle = Colors.Pacman
		this.isSplitting
 			? this.#drawSplittingBody()
	 		: this.#drawRadialBurst()
		ctx.restore()
	}
	#drawSplittingBody() {
		const {ctx}= this
		ctx.beginPath()
		ctx.moveTo(0, PacR*0.3)
		ctx.arc(0, 0, PacR, -PI/2+this.#arkAng, -PI/2-this.#arkAng)
		ctx.fill()
	}
	#drawRadialBurst() {
		const {ctx}= this
		ctx.setAlpha(this.#fadeOut?.alpha)
		for (const deg of range(0, 360, 360/10)) {
			ctx.beginPath()
	 		ctx.moveTo(...circumPosition(deg, this.#innerR))
	     	ctx.lineTo(...circumPosition(deg, this.#outerR))
	     	ctx.stroke()
		}
	}
}
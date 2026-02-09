const SplitDur = 1149/Ticker.Interval
const BurstDur =  300/Ticker.Interval

export class Dying {
	#innerR
	#outerR
	#arkAng  = 0
	#fadeOut = Fade.out(300)
	/** @private @readonly */ctx
	/** @private @readonly */r
	constructor(ctx=Ctx, radius=PacRadius) {
		this.ctx = ctx
		this.r = radius
		this.#innerR = radius/4
		this.#outerR = radius/2
	}
	get isSplitting() {
		return this.#arkAng < PI-PI/SplitDur
	}
	update() {
		this.isSplitting
			? this.#arkAng += PI/SplitDur
			: this.#updateRadialBurst()
	}
	#updateRadialBurst() {
		if (this.#outerR <= this.r) {
			this.#innerR += this.r*0.4/BurstDur
			this.#outerR += this.r*1.0/BurstDur
			return
		}
		this.#fadeOut.update()
	}
	draw({x=0,y=0}={}) {
		const {ctx}= this
		ctx.save()
		ctx.translate(x,y)
		ctx.lineWidth = this.r*0.21
		ctx.fillStyle = ctx.strokeStyle = Colors.Pacman
		this.isSplitting
 			? this.#drawSplittingBody()
	 		: this.#drawRadialBurst()
		ctx.restore()
	}
	#drawSplittingBody() {
		const {ctx}= this
		ctx.beginPath()
		ctx.moveTo(0, this.r*0.3)
		ctx.arc(0, 0, this.r, -PI/2+this.#arkAng, -PI/2-this.#arkAng)
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
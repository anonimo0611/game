const SplitDur = 1200/Ticker.Interval
const BurstDur =  300/Ticker.Interval
const TotalDur = SplitDur+BurstDur+30

export class Dying {
	#fadeOut = Fade.out(300);
	#cnt; #fn; #innerR; #outerR; #arkAng;

	/** @readonly */ctx
	/** @readonly */radius
	/**
	 @param {{ctx:EnhancedCtx2D,radius:number}} _
	 @param {()=> void} [fn]
	*/
	constructor({ctx,radius=PacRadius}, fn) {
		this.#fn     = fn
		this.#cnt    = this.#arkAng = 0
		this.ctx     = ctx
		this.radius  = radius
		this.#innerR = radius/4
		this.#outerR = radius/2
	}
	get isSplitting() {
		return this.#arkAng < PI-PI/SplitDur
	}
	update() {
		if (this.#cnt++ > TotalDur) {
			this.#fn?.()
			this.#fn = undefined
			return
		}
		this.isSplitting
			? this.#arkAng += PI/SplitDur
			: this.#updateRadialBurst()
	}
	#updateRadialBurst() {
		if (this.#outerR <= this.radius) {
			this.#innerR += this.radius*0.4/BurstDur
			this.#outerR += this.radius*1.0/BurstDur
			return
		}
		this.#fadeOut.update()
	}
	draw({x=0,y=0,radius:r=this.radius}={}) {
		const {ctx,radius}= this
		ctx.save()
		ctx.translate(x,y)
		ctx.scale(r/radius, r/radius)
		ctx.lineWidth = radius*0.21
		ctx.fillStyle = ctx.strokeStyle = Colors.Pacman
		this.isSplitting
 			? this.#drawSplittingBody()
	 		: this.#drawRadialBurst()
		ctx.restore()
	}
	#drawSplittingBody() {
		const {ctx,radius}= this
		ctx.beginPath()
		ctx.moveTo(0, radius*0.3)
		ctx.arc(0, 0, radius, -PI/2+this.#arkAng, -PI/2-this.#arkAng)
		ctx.fill()
	}
	#drawRadialBurst() {
		const {ctx}= this
		ctx.setAlpha(this.#fadeOut?.alpha)
		for (const deg of range(0, 360, 360/10)) {
			ctx.beginPath()
			ctx.moveTo(...getCircum(deg*PI/180, this.#innerR).vals)
			ctx.lineTo(...getCircum(deg*PI/180, this.#outerR).vals)
			ctx.stroke()
		}
	}
}
const SplitDur = 1200/Ticker.Interval
const BurstDur =  300/Ticker.Interval
const TotalDur = SplitDur+BurstDur+30

import {PacScale} from './pacman.js'
export class Dying {
	/** @readonly */ctx
	/** @readonly */Radius
	#cnt;    #cb;
	#innerR; #outerR;
	#arkAng; #fadeOut = Fade.out(300);

	/**
	 @param {{ctx:EnhancedCtx2D,Radius:number}} _
	 @param {()=> void} [cb]
	*/
	constructor({ctx,Radius}, cb) {
		this.ctx     = ctx
		this.Radius  = Radius
		this.#cb     = cb
		this.#cnt    = this.#arkAng = 0
		this.#innerR = Radius/4
		this.#outerR = Radius/2
	}
	get isSplitting() {
		return this.#arkAng < PI-PI/SplitDur
	}
	update() {
		if (this.#cnt++ > TotalDur) {
			this.#cb?.()
			this.#cb = undefined
			return
		}
		this.isSplitting
			? this.#arkAng += PI/SplitDur
			: this.#updateRadialBurst()
	}
	#updateRadialBurst() {
		if (this.#outerR <= this.Radius) {
			this.#innerR += this.Radius*0.4/BurstDur
			this.#outerR += this.Radius*1.0/BurstDur
			return
		}
		this.#fadeOut.update()
	}
	draw({x=0,y=0,radius:r=this.Radius}={}) {
		const {ctx,Radius}= this
		ctx.save()
		ctx.translate(x,y)
		ctx.scale(r/Radius*PacScale)
		ctx.lineWidth = Radius*0.21
		ctx.fillStyle = ctx.strokeStyle = Color.Pacman
		this.isSplitting
 			? this.#drawSplittingBody()
	 		: this.#drawRadialBurst()
		ctx.restore()
	}
	#drawSplittingBody() {
		const {ctx,Radius}= this
		ctx.beginPath()
		ctx.moveTo(0, Radius*0.3)
		ctx.arc(0, 0, Radius, -PI/2+this.#arkAng, -PI/2-this.#arkAng)
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
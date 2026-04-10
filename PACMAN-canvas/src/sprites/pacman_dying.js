const SPLIT_DUR = 1200/Ticker.Interval
const BURST_DUR =  300/Ticker.Interval
const TOTAL_DUR = SPLIT_DUR+BURST_DUR+30

import {SCALE_FACTOR} from './pacman.js'
export class Dying {
	/** @readonly */ctx
	/** @readonly */Radius
	#cnt;    #cb;
	#innerR; #outerR;
	#arcAng; #fadeOut = Fade.out(300);

	/**
	 @param {{ctx:EnhancedCtx2D,Radius:number}} _
	 @param {()=> void} [cb]
	*/
	constructor({ctx,Radius}, cb) {
		this.ctx     = ctx
		this.Radius  = Radius
		this.#cb     = cb
		this.#cnt    = this.#arcAng = 0
		this.#innerR = Radius/4
		this.#outerR = Radius/2
	}
	get isSplitting() {
		return this.#arcAng < PI-PI/SPLIT_DUR
	}
	update() {
		if (this.#cnt++ > TOTAL_DUR) {
			this.#cb?.()
			this.#cb = undefined
			return
		}
		this.isSplitting
			? this.#arcAng += PI/SPLIT_DUR
			: this.#updateRadialBurst()
	}
	#updateRadialBurst() {
		if (this.#outerR <= this.Radius) {
			this.#innerR += this.Radius*0.4/BURST_DUR
			this.#outerR += this.Radius*1.0/BURST_DUR
			return
		}
		this.#fadeOut.update()
	}
	draw({x=0,y=0,radius:r=this.Radius}={}) {
		const {ctx,Radius}= this
		ctx.save()
		ctx.translate(x,y)
		ctx.scale(r/Radius*SCALE_FACTOR)
		ctx.lineWidth = Radius*0.21
		ctx.fillStyle = ctx.strokeStyle = Color.Pacman
		this.isSplitting
 			? this.#drawSplittingBody()
	 		: this.#drawRadialBurst()
		ctx.restore()
	}
	#drawSplittingBody() {
		const {ctx,Radius}= this
		const angle = this.#arcAng
		ctx.beginPath()
		ctx.moveTo(0, Radius*0.3)
		ctx.arc(0, 0, Radius, -PI/2+angle, -PI/2-angle)
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
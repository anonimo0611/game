const SPLIT_DUR = 1200/Ticker.Interval
const BURST_DUR =  300/Ticker.Interval
const TOTAL_DUR = SPLIT_DUR+BURST_DUR+30

import {SCALE_FACTOR} from './pacman.js'
export class Dying {
	/** @readonly */ctx
	/** @readonly */r
	#cnt;    #cb;
	#innerR; #outerR;
	#arcAng; #fadeOut = Fade.out(300);
	/**
	 @param {{ctx:EnhancedCtx2D,r:number}} _
	 @param {()=> void} [cb]
	*/
	constructor({ctx,r}, cb) {
		this.ctx     = ctx
		this.#cb     = cb
		this.#cnt    = this.#arcAng = 0
		this.r       = r
		this.#innerR = r/4
		this.#outerR = r/2
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
		if (this.#outerR <= this.r) {
			this.#innerR += this.r*0.4/BURST_DUR
			this.#outerR += this.r*1.0/BURST_DUR
			return
		}
		this.#fadeOut.update()
	}
	draw({x=0,y=0,radius:r=this.r}={}) {
		const {ctx,r:defaultR}= this
		ctx.save()
		ctx.translate(x,y)
		ctx.scale(r/defaultR*SCALE_FACTOR)
		ctx.lineWidth = defaultR*0.21
		ctx.fillStyle = ctx.strokeStyle = Color.Pacman
		this.isSplitting
 			? this.#drawSplittingBody()
	 		: this.#drawRadialBurst()
		ctx.restore()
	}
	#drawSplittingBody() {
		const {ctx,r}= this
		const angle = this.#arcAng
		ctx.beginPath()
		ctx.moveTo(0, r*0.3)
		ctx.arc(0, 0, r, -PI/2+angle, -PI/2-angle)
		ctx.fill()
	}
	#drawRadialBurst() {
		const {ctx}= this, steps = 10
		ctx.setAlpha(this.#fadeOut?.alpha)
		for (let i=0; i<steps; i++) {
			const r = (i*PI*2)/steps
			ctx.newLinePath(
				getPointOnCircle(r, this.#innerR).vals,
				getPointOnCircle(r, this.#outerR).vals
			).stroke()
		}
	}
}
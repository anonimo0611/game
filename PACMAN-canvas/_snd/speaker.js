export class SpeakerRenderer {
	/** @readonly*/ctx
	/** @readonly*/color
	/**
	 @param {EnhancedCtx2D} ctx
	 @param {Cvs2DStyle} color
	*/
	constructor(ctx, color='#FFF') {
		this.ctx   = ctx
		this.color = color
	}
	draw(/**@type {number}*/vol) {
		const {ctx,ctx:{size:{w,h}}}= this
		const step = this.#getSteps(vol)
		ctx.clear()
		ctx.save()
		ctx.fillStyle = ctx.strokeStyle = this.color
		ctx.translate(w/2, h/2)
		ctx.scale(w/100, h/100)
		ctx.fillPolygon(null,
			[ -7, -35],[-31, -12],[-45, -12],
			[-45, +12],[-31, +12],[ -7, +35])
		step <= 0
			? this.#drawMuteCross()
			: this.#drawWaves(vol, step)
		ctx.restore()
	}
	#getSteps(/**@type {number}*/vol) {
		if (between(vol,8,10)) return 3
		if (between(vol,3, 7)) return 2
		if (between(vol,1, 2)) return 1
		return 0
	}
	#drawMuteCross() {
		const {ctx}= this
		ctx.save()
		ctx.translate(24, 0)
		ctx.lineWidth = 10
		ctx.strokeLine(-18, -18, +18, +18)
		ctx.strokeLine(+18, -18, -18, +18)
		ctx.restore()
	}
	#drawWaves(
	 /**@type {number}*/vol,
	 /**@type {number}*/step
	) {
		const {ctx}= this
		ctx.save()
		ctx.lineCap = 'round'
		ctx.lineWidth = 8
		;[
			[0.0, 12, 14, -PI/2.6, PI/2.6],
			[4.5, 25, 25, -PI/2.9, PI/2.9],
			[8.5, 37, 40, -PI/3.3, PI/3.3],
		].forEach(([x,rX,rY,st,ed], idx)=> {
			ctx.save()
			ctx.setAlpha(step <= idx && vol/10 || 1)
			ctx.beginPath()
			ctx.ellipse(x,0, rX,rY, 0, st,ed)
			ctx.stroke()
			ctx.restore()
		})
		ctx.restore()
	}
}
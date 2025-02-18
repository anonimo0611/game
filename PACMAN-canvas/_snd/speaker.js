const {cvs,ctx}= canvas2D('speakerCvs', +$('#volume').height())
export const Speaker = new class {
	draw(vol) {
		const {width,height}= cvs
		const step = this.#step(vol)
		ctx.clear()
		ctx.save()
		ctx.fillStyle = ctx.strokeStyle = '#FFF'
		ctx.translate(width/2, height/2)
		ctx.scale(width/100, height/100)
		this.#drawBody()
		step <= 0
			? this.#drawMute()
			: this.#drawWaves(vol, step)
		ctx.restore()
	}
	#step(v) {
		if (v == 0) return 0
		if (between(v, 8, 10)) return 3
		if (between(v, 3,  7)) return 2
		if (between(v, 1,  2)) return 1
	}
	#drawBody() {
		cvsSetNewLinePath(ctx)(
			[ -7, -35],[-31, -12],[-45, -12],
			[-45, +12],[-31, +12],[ -7, +35])
		ctx.fill()
	}
	#drawMute() {
		ctx.save()
		ctx.translate(24, 0)
		ctx.lineWidth = 10
		cvsStrokeLine(ctx)(-18, -18, +18, +18)
		cvsStrokeLine(ctx)(+18, -18, -18, +18)
		ctx.restore()
	}
	#drawWaves(vol, step) {
		ctx.save()
		ctx.lineCap = 'round'
		ctx.lineWidth = 8
		;[[0.0, 0, 12, 14, 0, -PI/2.6, PI/2.6],
		  [4.5, 0, 25, 25, 0, -PI/2.9, PI/2.9],
		  [8.5, 0, 37, 40, 0, -PI/3.3, PI/3.3],
		].forEach((v,s)=> {
			ctx.save()
			step <= s && (ctx.globalAlpha = vol/10)
			ctx.beginPath()
			ctx.ellipse(...v)
			ctx.stroke()
			ctx.restore()
		})
		ctx.restore()
	}
}
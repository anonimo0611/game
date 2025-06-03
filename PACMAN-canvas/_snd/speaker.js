const Size = nonNull(byId('volume')).offsetHeight
const{cvs,ctx}= canvas2D('cvs_speaker', Size)

export const Speaker = new class {
	draw(/**@type {number}*/vol) {
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
	#step(/**@type {number}*/vol) {
		if (between(vol, 8, 10)) return 3
		if (between(vol, 3,  7)) return 2
		if (between(vol, 1,  2)) return 1
		return 0
	}
	#drawBody() {
		ctx.newLinePath(
			[ -7, -35],[-31, -12],[-45, -12],
			[-45, +12],[-31, +12],[ -7, +35])
		ctx.fill()
	}
	#drawMute() {
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
		ctx.save()
		ctx.lineCap = 'round'
		ctx.lineWidth = 8
		;([[0.0, 12, 14, -PI/2.6, PI/2.6],
		   [4.5, 25, 25, -PI/2.9, PI/2.9],
		   [8.5, 37, 40, -PI/3.3, PI/3.3],
		]).forEach(([x,rX,rY,st,ed], idx)=> {
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
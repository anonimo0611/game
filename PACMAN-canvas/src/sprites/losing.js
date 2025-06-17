const PacR    = PacRadius
const DisDur  = 1149/Ticker.Interval
const LineDur =  300/Ticker.Interval
const FadeDur =  300/Ticker.Interval

export class Losing {
	#mAngle = 0
	#alpha  = 1
	#innerR = PacR/4
	#outerR = PacR/2
	constructor(ctx=Ctx) {
		this.ctx = ctx
		freeze(this)
	}
	draw({x=0,y=0}={}) {
		const {ctx}= this
		const clampedX = (ctx == Ctx)
			? clamp(x, PacR, CvsW-PacR) : x
		ctx.save()
		ctx.translate(clampedX, y)
		ctx.lineWidth = T/6
		ctx.fillStyle = ctx.strokeStyle = Color.Pacman
		this.#mAngle < PI - PI/DisDur
 			? this.#disappear(this)
	 		: this.#drawRadialLines(this)
		ctx.restore()
	}
	#disappear({ctx}=this) {
		const mAngle = this.#mAngle += PI/DisDur
		ctx.beginPath()
		ctx.moveTo(0,PacR*0.35)
		ctx.arc(0,0, PacR, -PI/2+mAngle,-PI/2-mAngle)
		ctx.fill()
	}
	#drawRadialLines({ctx}=this) {
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
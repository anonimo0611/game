import {Ticker}  from '../../_lib/timer.js'
import {Cvs,Ctx} from '../_canvas.js'
import {Color,TileSize,PacRadius as R} from '../_constants.js'

const DisDur  = 1149/Ticker.Interval
const LineDur =  300/Ticker.Interval
const FadeDur =  300/Ticker.Interval

export class Losing {
	constructor() {freeze(this)}
	#mAngle = 0
	#alpha  = 1
	#innerR = R/4
	#outerR = R/2
	draw(ctx=Ctx, {x=0,y=0}={}) {
		const clampedX = (ctx == Ctx)
			? clamp(x, R, Cvs.width-R) : x
		ctx.save()
		ctx.translate(clampedX, y)
		ctx.lineWidth = TileSize/6
		ctx.fillStyle = ctx.strokeStyle = Color.Pacman
		this.#mAngle < PI - PI/DisDur
 			? this.#disappear(ctx)
	 		: this.#drawRadialLines(ctx)
		ctx.restore()
	}
	#disappear(ctx=Ctx) {
		const mAngle = this.#mAngle += PI/DisDur
		ctx.beginPath()
		ctx.moveTo(0, R*0.35)
		ctx.arc(0,0, R, -PI/2+mAngle,-PI/2-mAngle)
		ctx.fill()
	}
	#drawRadialLines(ctx=Ctx) {
		const innerR = min(this.#innerR += R/2/LineDur, R/2)
		const outerR = min(this.#outerR += R/1/LineDur, R/1)
		if (this.#outerR >= R)
			ctx.globalAlpha = max(this.#alpha -= 1/FadeDur, 0)
		for (let deg=0; deg<360; deg+=360/10) {
			ctx.beginPath()
	 		ctx.moveTo(...circumPosition(deg, innerR))
	     	ctx.lineTo(...circumPosition(deg, outerR))
	     	ctx.stroke()
		}
	}
}
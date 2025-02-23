import {Ticker} from '../../_lib/timer.js'
import {CvsW,Ctx,Color,TileSize,PacRadius as R} from '../_constants.js'

const DisDur  = 1149/Ticker.Interval
const LineDur =  300/Ticker.Interval
const FadeDur =  300/Ticker.Interval

export class Losing {
	#mAngle = 0
	#alpha  = 1
	#innerR = R/4
	#outerR = R/2
	constructor(ctx=Ctx) {
		this.ctx = ctx
		freeze(this)
	}
	draw({x=0,y=0}={}) {
		const {ctx}= this
		const clampedX = (ctx == Ctx)
			? clamp(x, R, CvsW-R) : x
		ctx.save()
		ctx.translate(clampedX, y)
		ctx.lineWidth = TileSize/6
		ctx.fillStyle = ctx.strokeStyle = Color.Pacman
		this.#mAngle < PI - PI/DisDur
 			? this.#disappear(this)
	 		: this.#drawRadialLines(this)
		ctx.restore()
	}
	#disappear({ctx}=this) {
		const mAngle = this.#mAngle += PI/DisDur
		ctx.beginPath()
		ctx.moveTo(0, R*0.35)
		ctx.arc(0,0, R, -PI/2+mAngle,-PI/2-mAngle)
		ctx.fill()
	}
	#drawRadialLines({ctx}=this) {
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
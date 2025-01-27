import {Ticker}  from '../../_lib/timer.js'
import {Cvs,Ctx} from '../_canvas.js'
import {Color,TileSize} from '../_constants.js'

const StRadius = TileSize * 0.5
const EdRadius = TileSize * 0.9
const DisDur   = 1149/Ticker.Interval
const LineDur  =  300/Ticker.Interval
const FadeDur  =  300/Ticker.Interval

export class Losing {
	constructor() {freeze(this)}
	#angle  = 0
	#lineA  = 1
	#innerR = TileSize * 0.2
	#outerR = StRadius
	draw(ctx=Ctx, x,y, Radius) {
		if (ctx == Ctx)
			x = clamp(x, Radius, Cvs.width-Radius)
		this.#angle < PI - PI/DisDur
 			? this.#disappear(ctx, x,y, Radius)
	 		: this.#drawLines(ctx, x,y)
	}
	#disappear(ctx=Ctx, x,y, Radius) {
		const angle = this.#angle += PI/DisDur
		ctx.save()
		ctx.translate(x, y)
		ctx.beginPath()
		ctx.moveTo(0, Radius*0.35)
		ctx.arc(0,0, Radius, -PI/2+angle,-PI/2-angle)
		ctx.fillStyle = Color.Pacman
		ctx.fill()
		ctx.restore()
	}
	#drawLines(ctx=Ctx, x,y) {
		const innerR = min(this.#innerR += StRadius/LineDur, StRadius)
		const outerR = min(this.#outerR += EdRadius/LineDur, EdRadius)
		ctx.save()
		ctx.translate(x, y)
		if (this.#outerR >= EdRadius) {
			ctx.globalAlpha = max(this.#lineA -= 1/FadeDur, 0)
		}
		for (let deg=0; deg<360; deg+=360/10) {
			ctx.beginPath()
	 		ctx.moveTo(...circumPosition(deg, innerR))
	     	ctx.lineTo(...circumPosition(deg, outerR))
			ctx.lineWidth   = TileSize/6
			ctx.strokeStyle = Color.Pacman
	     	ctx.stroke()
		}
		ctx.restore()
	}
}
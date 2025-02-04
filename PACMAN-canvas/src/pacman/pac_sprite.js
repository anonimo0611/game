import {Ticker}  from '../../_lib/timer.js'
import {U,R,D,L} from '../../_lib/direction.js'
import {Ctx}     from '../_canvas.js'
import {Losing}  from './pac_losing.js'
import {Color,PacRadius} from '../_constants.js'

const Duration  = 150/Ticker.Interval
const OpenMid   = 30 * PI/180
const OpenMax   = 60 * PI/180
const RotateMap = new Map([[R,0],[D,1],[L,2],[U,3]])

export default class {
	/** @type {?Losing} */
	#losing  = null
	#mAngle  =  0
	#animDir = -1
	constructor({openType=0}={}) {
		this.#mAngle = [0,OpenMid,OpenMax][openType]
	}
	update({stopped=false}={}) {
		if (stopped && this.#mAngle > OpenMid) return
		const dir = between(this.#mAngle, 0, OpenMax) ? 1 : -1
		this.#mAngle += OpenMax/Duration * (this.#animDir*=dir)
	}
	draw(ctx=Ctx, {
		centerPos:{x,y}={x:0,y:0},
		orient    = L,
		radius    = PacRadius,
		frozen    = false,
		closed    = false,
		centerDot = false}={}, scale=1
	) {
		if (frozen || this.#losing)
			return this.#losing?.draw(ctx, {x,y})
		const mAngle = (closed? 0:this.#mAngle)
		ctx.save()
		ctx.translate(x, y)
		ctx.rotate(RotateMap.get(orient) * PI/2)
		ctx.beginPath()
		ctx.moveTo(-radius*scale*0.35, 0)
		ctx.arc(0,0,radius*scale, mAngle, PI*2-mAngle)
		ctx.fillStyle = Color.Pacman
		ctx.fill()
		ctx.restore()
		centerDot && cvsFillCircle(ctx)(x,y, 3, '#F00')
	}
	setLosing() {this.#losing = new Losing}
}

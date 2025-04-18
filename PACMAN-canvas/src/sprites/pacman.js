const Duration  = 150/Ticker.Interval
const OpenMid   = 30 * PI/180
const OpenMax   = 60 * PI/180
const RotateMap = new Map([[R,0],[D,1],[L,2],[U,3]])

import {Losing} from './losing.js'
export default class {
	/** @type {?Losing} */
	#losing  = null
	#mAngle  =  0
	#animDir = -1
	/** @param {ExtendedContext2D} ctx */
	constructor(ctx, {openType=0}={}) {
		this.ctx = ctx
		this.#mAngle = [0,OpenMid,OpenMax][openType]
	}
	update({stopped=false}={}) {
		if (stopped && this.#mAngle > OpenMid) return
		const dir = between(this.#mAngle, 0, OpenMax) ? 1 : -1
		this.#mAngle += OpenMax/Duration * (this.#animDir*=dir)
	}
	draw({
		centerPos:{x,y}={x:0,y:0},
		orient     = L,
		radius     = PacRadius,
		frozen     = false,
		closed     = false,
		showCenter = false}={}, scale=1
	) {
		if (frozen || this.#losing)
			return this.#losing?.draw({x,y})
		const {ctx}  = this
		const mAngle = (closed? 0:this.#mAngle)
		ctx.save()
		ctx.translate(x, y)
		ctx.rotate(RotateMap.get(orient) * PI/2)
		ctx.beginPath()
		ctx.moveTo(-radius*scale*0.35, 0)
		ctx.arc(0,0,radius*scale, mAngle, PI*2-mAngle)
		ctx.fillStyle = Color.Pacman
		ctx.fill()
			showCenter && ctx.fillCircle(0,0, 3, Color.PacCenter)
		ctx.restore()
	}
	setLosing() {this.#losing = new Losing(this.ctx)}
}
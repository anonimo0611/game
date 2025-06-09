const Duration = 150/Ticker.Interval
const OpenMid  = 30 * PI/180
const OpenMax  = 60 * PI/180
const Rotation = /**@type {const}*/({[R]:0, [D]:1, [L]:2, [U]:3})

import {Losing} from './losing.js'
export default class {
	#mAngle  =  0
	#animDir = -1
	#losing  = /**@type {?Losing}*/(null)

	/**
	 * @param {ExtendedContext2D} ctx
	 * @param {0|1|2} mouseOpening
	 */
	constructor(ctx, mouseOpening=0) {
		this.ctx = ctx
		this.#mAngle = [0,OpenMid,OpenMax][mouseOpening]
		freeze(this)
	}
	update({stopped=false}={}) {
		if (stopped && this.#mAngle > OpenMid)
			return
		const dir = between(this.#mAngle, 0, OpenMax) ? 1 : -1
		this.#mAngle += OpenMax/Duration * (this.#animDir*=dir)
	}
	draw({
		centerPos:{x,y}={x:0,y:0},
		orient     = /**@type {Direction}*/(L),
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
		ctx.translate(x,y)
		ctx.rotate(Rotation[orient] * PI/2)
		ctx.beginPath()
		ctx.moveTo(-radius*scale*0.35, 0)
		ctx.arc(0,0,radius*scale, mAngle, PI*2-mAngle)
		ctx.fillStyle = Color.Pacman
		ctx.fill()
		ctx.restore()
		showCenter && ctx.fillCircle(x,y, 3, Color.PacCenter)
	}
	setLosing() {this.#losing = new Losing(this.ctx)}
}
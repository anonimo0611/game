const Duration = 150/Ticker.Interval
const OpenMid  = 30 * PI/180
const OpenMax  = 60 * PI/180
const Rotation = /**@type {const}*/({[R]:0, [D]:1, [L]:2, [U]:3})

import {Dying} from './pacman_dying.js'
export default class {
	#mAngle  =  0
	#animDir = -1
	#dying   = /**@type {?Dying}*/(null)
	/**
	 * @param {ExtendedContext2D} ctx
	 * @param {0|1|2} mouthOpenings
	 * 0=closed, 1=middle opened, 2=max opened
	 */
	constructor(ctx, mouthOpenings=0) {
		this.ctx = ctx
		this.isMain  = ctx.canvas.id == 'cvs_main'
		this.#mAngle = [0,OpenMid,OpenMax][mouthOpenings]
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
		orient = /**@type {Direction}*/(L),
		radius = PacRadius,
		closed = false}={}, {scale=1}={}
	) {
		const {ctx}  = this
		const mAngle = (closed? 0:this.#mAngle)
		if (this.#dying) {
			this.isMain && (x = clamp(x, radius, CW-radius))
			return this.#dying.draw({x,y})
		}
		ctx.save()
		ctx.translate(x,y)
		ctx.rotate(Rotation[orient] * PI/2)
		ctx.beginPath()
		ctx.moveTo(-radius*scale*0.35, 0)
		ctx.arc(0,0,radius*scale, mAngle, PI*2-mAngle)
		ctx.fillStyle = Color.Pacman
		ctx.fill()
		ctx.restore()
	}
	setDying() {this.#dying = new Dying(this.ctx)}
}
const Duration = 300/Ticker.Interval
const OpenMid  = 30 * PI/180
const OpenMax  = 60 * PI/180
const Rotation = /**@type {const}*/({[R]:0, [D]:1, [L]:2, [U]:3})

import {Dying} from './pacman_dying.js'
export default class {
	#dyingSpr   = /**@type {?Dying}*/(null)
	#animeAngle = 0
	#mouthAngle = 0
	/**
	 * @param {ExtendedContext2D} ctx
	 * @param {0|1|2} mouthOpenings
	 * 0=closed, 1=middle opened, 2=max opened
	 */
	constructor(ctx, mouthOpenings=0) {
		this.ctx = ctx
		this.isMain  = ctx.canvas.id == 'cvs_main'
		this.#mouthAngle = [0,OpenMid,OpenMax][mouthOpenings]
		freeze(this)
	}
	update({stopped=false}={}) {
		if (stopped && this.#mouthAngle > OpenMid)
			return
		const rad = this.#animeAngle += PI/Duration
		this.#mouthAngle = OpenMax * abs(Math.sin(rad))
	}
	draw({
		center:{x,y}={x:0,y:0},
		hidden = false,
		closed = false,
		orient = /**@type {Direction}*/(L),
		radius = PacRadius}={}, {scale=1}={}
	) {
		if (hidden)
			return
		if (this.#dyingSpr) {
			this.isMain && (x = clamp(x, radius, CW-radius))
			return this.#dyingSpr.draw({x,y})
		}
		const {ctx}  = this
		const mAngle = (closed? 0:this.#mouthAngle)
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
	setDying() {this.#dyingSpr = new Dying(this.ctx)}
}
const Duration = 300/Ticker.Interval
const OpenMid  = 30 * PI/180
const OpenMax  = 60 * PI/180
const Rotation = new Map([[R,0],[D,PI/2],[L,PI],[U,PI*3/2]])

import {Dying} from './pacman_dying.js'
export default class {
	#dyingSpr   = /**@type {?Dying}*/(null)
	#angularV   = 0
	#mouthAngle = 0

	/** @readonly */ctx
	/** @readonly */isMain
	/**
	 @param {ExtendedContext2D} ctx
	 @param {0|1|2} mouthOpenings
	 0=closed, 1=middle opened, 2=max opened
	*/
	constructor(ctx, mouthOpenings=0) {
		this.ctx    = ctx
		this.isMain = ctx.canvas.id == 'board_main'
		this.#mouthAngle = [0,OpenMid,OpenMax][mouthOpenings]
	}
	update({stopped=false}={}) {
		if (stopped && this.#mouthAngle > OpenMid-PI/Duration/2)
			return
		const v = this.#angularV += PI/Duration
		this.#mouthAngle = OpenMax * abs(Math.sin(v))
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
			this.isMain && (x = clamp(x, radius, BW-radius))
			return this.#dyingSpr.draw({x,y})
		}
		const {ctx}  = this
		const mAngle = (closed? 0:this.#mouthAngle)
		ctx.save()
		ctx.translate(x,y)
		ctx.rotate(Rotation.get(orient) ?? 0)
		ctx.beginPath()
		ctx.moveTo(-radius*scale*0.3, 0)
		ctx.arc(0,0,radius*scale, mAngle, PI*2-mAngle)
		ctx.fillStyle = Color.Pacman
		ctx.fill()
		ctx.restore()
	}
	setDying() {this.#dyingSpr = new Dying(this.ctx)}
}
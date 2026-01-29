const Duration = 300/Ticker.Interval
const OpenMid  = 30 * PI/180
const OpenMax  = 60 * PI/180
const Rotation = new Map([[R,0],[D,PI/2],[L,PI],[U,-PI/2]])

import {Dying} from './pacman_dying.js'
export default class {
	#dyingSpr   = /**@type {?Dying}*/(null)
	#mouthPhase = 0
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
	update({closed=false,hidden=false,onWall=false}={}) {
		this.#dyingSpr
			? this.#dyingSpr.update()
			: !closed && !hidden && this.#chew(onWall)
	}
	#chew(onWall=false) {
		if (onWall) {
			if (this.#mouthAngle <= OpenMid)
				this.#mouthAngle = OpenMid
			return
		}
		const phase = this.#mouthPhase += PI/Duration
		this.#mouthAngle = OpenMax * abs(sin(phase))
	}
	draw({
		center:{x,y}={x:0,y:0},
		orient = /**@type {Direction}*/(L),
		hidden = false,
		closed = false,
		radius = PacRadius}={}, {scale=1}={}
	) {
		if (hidden)
			return
		if (this.#dyingSpr) {
			this.isMain && (x = clamp(x, radius, BW-radius))
			return this.#dyingSpr.draw({x,y})
		}
		const {ctx}  = this
		const PacR   = radius*scale
		const mAngle =(closed? 0:this.#mouthAngle)
		ctx.save()
		ctx.translate(x,y)
		ctx.rotate(Rotation.get(orient) ?? 0)
		ctx.beginPath()
		ctx.moveTo(-PacR*0.3, 0)
		ctx.arc(0, 0, PacR, mAngle, PI*2-mAngle)
		ctx.fillStyle = Colors.Pacman
		ctx.fill()
		ctx.restore()
	}
	setDying(r=PacRadius) {this.#dyingSpr = new Dying(this.ctx,r)}
}
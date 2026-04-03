const Duration = 300/Ticker.Interval
const OpenMid  = 30 * PI/180
const OpenMax  = 60 * PI/180

import {Dir}   from '../../_lib/direction.js';
import {Dying} from './pacman_dying.js'
export const ScaleModif = 0.9
export default class PacmanSprite {
	/** @readonly */ctx
	/** @readonly */Radius
	#mPhase = 0
	#mAngle = 0
	#dyingSpr = /**@type {?Dying}*/(null)

	/**
	 @param {EnhancedCtx2D} ctx
	 @param {number} radius
	 @param {0|1|2} initialOpening 0=closed, 1=half open, 2=fully open
	*/
	constructor(ctx, radius, initialOpening=0) {
		this.ctx     = ctx
		this.Radius  = radius
		this.#mAngle = [0,OpenMid,OpenMax][initialOpening]
	}
	update({closed=false,hidden=false,onWall=false}={}) {
		this.#dyingSpr
			? this.#dyingSpr.update()
			: !closed && !hidden && this.#chew(onWall)
	}
	#chew(onWall=false) {
		if (onWall) {
			if (this.#mAngle <= OpenMid)
				this.#mAngle = OpenMid
			return
		}
		const phase = this.#mPhase += PI/Duration
		this.#mAngle = OpenMax * abs(sin(phase))
	}
	draw({
		center:{x,y}={x:0,y:0},
		orient = /**@type {Direction}*/(L),
		alpha  = 1,
		hidden = false,
		closed = false,
		radius = this.Radius}={}
	) {
		if (hidden) {
			return
		}
		if (this.#dyingSpr) {
			this.#dyingSpr.draw({x,y,radius})
			return
		}
		const {ctx} = this
		const angle = (closed? 0:this.#mAngle)
		ctx.save()
		ctx.setAlpha(alpha)
		ctx.translate(x,y)
		ctx.scale(ScaleModif)
		ctx.rotate(Dir.Rotation[orient])
		ctx.beginPath()
		ctx.moveTo(-radius*0.3, 0)
		ctx.arc(0, 0, radius, angle, PI*2-angle)
		ctx.fillStyle = Color.Pacman
		ctx.fill()
		ctx.restore()
	}
	/** @param {()=> void} cb */
	startDying(cb) {
		this.#dyingSpr = new Dying(this, cb)
	}
}
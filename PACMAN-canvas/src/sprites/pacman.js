const Duration = 300/Ticker.Interval
const OpenMid  = 30 * PI/180
const OpenMax  = 60 * PI/180

import {Dir}   from '../../_lib/direction.js';
import {Dying} from './pacman_dying.js'
export default class PacmanSprite {
	#mouthPhase  = 0
	#mouthAngle  = 0
	#dyingSprite = /**@type {?Dying}*/(null)

	/** @readonly */ctx
	/** @readonly */radius
	/**
	 @param {EnhancedCtx2D} ctx
	 @param {0|1|2} initialMouthOpening 0=closed, 1=half open, 2=fully open
	*/
	constructor(ctx, initialMouthOpening=0, radius=PacRadius) {
		this.ctx    = ctx
		this.radius = radius
		this.#mouthAngle = [0,OpenMid,OpenMax][initialMouthOpening]
	}
	update({closed=false,hidden=false,onWall=false}={}) {
		this.#dyingSprite
			? this.#dyingSprite.update()
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
		alpha  = 1,
		hidden = false,
		closed = false,
		radius = this.radius}={}
	) {
		if (hidden)
			return
		if (this.#dyingSprite) {
			this.#dyingSprite.draw({x,y})
			return
		}
		const {ctx} = this
		const angle = (closed? 0:this.#mouthAngle)
		ctx.save()
		ctx.setAlpha(alpha)
		ctx.translate(x,y)
		ctx.rotate(Dir.Rotation[orient])
		ctx.beginPath()
		ctx.moveTo(-radius*0.3, 0)
		ctx.arc(0, 0, radius, angle, PI*2-angle)
		ctx.fillStyle = Colors.Pacman
		ctx.fill()
		ctx.restore()
	}
	/** @param {()=> void} fn */
	startDying(fn) {
		this.#dyingSprite = new Dying(this, fn)
	}
}
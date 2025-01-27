import {Ticker}  from '../../_lib/timer.js'
import {U,R,D,L} from '../../_lib/direction.js'
import {Ctx}     from '../_canvas.js'
import {Losing}  from './pac_losing.js'
import {Color}   from '../_constants.js'

const Duration  = 150/Ticker.Interval
const OpenMid   = 30 * PI/180
const OpenMax   = 60 * PI/180
const RotateMap = new Map([[R,0],[D,1],[L,2],[U,3]])

export default class {
	/** @type {?Losing} */
	#losing  = null
	#mouth   =  0
	#animDir = -1
	constructor(state={}, openType=0) {
		this.state  = state ?? {}
		this.#mouth = [0,OpenMid,OpenMax][openType]
		freeze(this)
	}
	get mouthAngle() {
		return this.state.mouthClosed? 0 : this.#mouth
	}
	update() {
		if (this.state.stopped && this.mouthAngle > OpenMid) return
		const dir = between(this.mouthAngle, 0, OpenMax) ? 1 : -1
		this.#mouth += OpenMax/Duration * (this.#animDir*=dir)
	}
	draw(ctx=Ctx, {x=0,y=0}={}, scale=1) {
		const {state}=this, Radius=state.Radius*scale
		if (this.#losing) {
			this.#losing.draw(ctx, x,y, Radius)
			return
		}
		ctx.save()
	 	ctx.translate(x, y)
		ctx.rotate(RotateMap.get(state.orient ?? L) * PI/2)
		ctx.beginPath()
		ctx.moveTo(-Radius*0.35, 0)
		ctx.arc(0,0, Radius, this.mouthAngle, PI*2-this.mouthAngle)
		ctx.fillStyle = Color.Pacman
		ctx.fill()
		ctx.restore()
		state.showCenter && cvsFillCircle(ctx)(x, y, 3, '#F00')
	}
	setLosing() {
		this.#losing = new Losing
	}
}
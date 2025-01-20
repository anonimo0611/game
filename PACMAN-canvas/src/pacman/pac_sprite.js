import {Ticker}  from '../../_lib/timer.js'
import {U,R,D,L} from '../../_lib/direction.js'
import {Ctx}     from '../_canvas.js'
import {Losing}  from './pac_losing.js'
import {Color,PacRadius} from '../_constants.js'

const Duration = 150/Ticker.Interval
const OpenMid  = 30 * PI/180
const OpenMax  = 60 * PI/180
const AngleMap = new Map([[R,0],[D,1],[L,2],[U,3]])

export default class {
	#losing  = null
	#rad     =  0
	#animDir = -1
	constructor(obj={}, openType=0) {
		this.obj  = obj
		this.#rad = [0,OpenMid,OpenMax][openType]
		freeze(this)
	}
	get angle() {
		return this.obj.mouthClosed? 0 : this.#rad
	}
	update() {
		if (this.obj.stopped && this.angle > OpenMid) return
		const dir = between(this.angle, 0, OpenMax) ? 1 : -1
		this.#rad += OpenMax/Duration * (this.#animDir*=dir)
	}
	draw(ctx=Ctx, {x=0,y=0}={}, scale=1) {
		const {obj}=this, Radius=(obj.Radius??PacRadius)*scale
		if (this.#losing) {
			this.#losing.draw(ctx, x,y, Radius)
			return
		}
		ctx.save()
	 	ctx.translate(x, y)
		ctx.rotate(AngleMap.get(obj.orient ?? L) * PI/2)
		ctx.beginPath()
		ctx.moveTo(-Radius*0.35, 0)
		ctx.arc(0,0, Radius, this.angle, PI*2-this.angle)
		ctx.fillStyle = Color.Pacman
		ctx.fill()
		ctx.restore()
		obj.showCenter && cvsFillCircle(ctx)(x, y, 3, '#F00')
	}
	setLosing() {
		this.#losing = new Losing
	}
}
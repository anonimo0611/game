import {Ticker} from '../../_lib/timer.js'
import {Dir}    from '../../_lib/direction.js'
import {Ctx}    from '../_canvas.js'
import {Losing} from './pac_losing.js'
import {Color,PacRadius} from '../_constants.js'

const Duration   = 150/Ticker.Interval
const RotateEnum = freeze({Left:0,Up:1,Right:2,Down:3})

export const MouthMax = 90 * PI/180
export const MouthMin = 20 * PI/180
export const MouthMid = 60 * PI/180

export default class {
	#losing  = null
	#rad     =  0
	#animDir = -1
	constructor(obj, {closed=true}={}) {
		this.obj  = isObj(obj) ? obj : {}
		this.#rad = obj?.mouthRad ?? (closed? MouthMax : MouthMid)
		freeze(this)
	}
	get rad()        {return this.#rad}
	get mouthAngle() {return this.obj.notPlaying? MouthMax : this.rad}
	get orient()     {return this.obj.orient}
	set orient(dir)  {this.obj.orient = dir}

	update() {
		const {obj,rad}= this
		if (obj.notPlaying || obj.stopped && rad < MouthMid) return
		if (rad < MouthMin || MouthMax < rad) this.#animDir *= -1
		this.#rad += (MouthMax - MouthMin)/Duration * this.#animDir
	}
	draw(ctx=Ctx, {x=0,y=0}={}, scale=1) {
		const {obj}= this, Radius = (obj.Radius ?? PacRadius)*scale
		if (this.#losing) {
			this.#losing.draw(ctx, x,y, Radius)
			return
		}
		ctx.save()
	 	ctx.translate(x, y)
		ctx.rotate(RotateEnum[obj.orient] * PI/2)
		ctx.beginPath()
		ctx.moveTo(Radius*0.35, 0)
		ctx.arc(0,0, Radius, -PI/2-this.mouthAngle, PI/2+this.mouthAngle)
		ctx.fillStyle = Color.Pacman
		ctx.fill()
		ctx.restore()
		obj.showCenter && cvsFillCircle(ctx)(x, y, 3, '#F00')
	}
	setLosing() {
		this.#losing = new Losing
	}
}
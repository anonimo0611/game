import {Ticker} from '../../_lib/timer.js'
import {L}      from '../../_lib/direction.js'
import {Ctx}    from '../_canvas.js'
import {Losing} from './pac_losing.js'
import {Color,PacRadius} from '../_constants.js'

const Duration   = 150/Ticker.Interval
const RotateEnum = freeze({Left:0,Up:1,Right:2,Down:3})

const Closed  = 90 * PI/180
const OpenMax = 20 * PI/180
const OpenMid = 60 * PI/180

export default class {
	#losing  = null
	#rad     =  0
	#animDir = -1
	constructor(obj={}) {
		this.obj  = obj
		this.#rad = [Closed,OpenMid,OpenMax][obj?.opening ?? 0]
		freeze(this)
	}
	get rad()        {return this.#rad}
	get mouthAngle() {return this.obj.notPlaying? Closed : this.rad}
	get orient()     {return this.obj.orient ?? L}
	set orient(dir)  {this.obj.orient = dir}

	update() {
		const {obj,rad}= this
		if (obj.notPlaying) return
		if (obj.stopped  && rad < OpenMid) return
		if (rad > Closed || rad < OpenMax) this.#animDir *= -1
		this.#rad += (Closed - OpenMax)/Duration * this.#animDir
	}
	draw(ctx=Ctx, {x=0,y=0}={}, scale=1) {
		const {obj}= this, Radius = (obj.Radius ?? PacRadius)*scale
		if (this.#losing) {
			this.#losing.draw(ctx, x,y, Radius)
			return
		}
		ctx.save()
	 	ctx.translate(x, y)
		ctx.rotate(RotateEnum[obj.orient ?? L] * PI/2)
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
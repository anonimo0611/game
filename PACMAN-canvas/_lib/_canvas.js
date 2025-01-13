'use strict'
const
canvas2D = (arg, _w=null, _h=_w)=> {
	let cvs = document.createElement('canvas')
	if (byId(arg) instanceof HTMLCanvasElement) cvs = byId(arg)
	const [w,h]= setCanvasSize(cvs)(_w,_h)
	const /** @type {CanvasRenderingContext2D} */
	ctx = cvs.getContext('2d')
	ctx.clear = (x=0,y=0,_w=w,_h=h)=> ctx.clearRect(x,y,_w,_h)
	/** @type {[cvs,ctx,w:number,h:number]} */
	const vals = [cvs,ctx,w,h]
	return {cvs,ctx,w,h,vals}
},
setCanvasSize = cvs=> (w=0, h=w)=> {
	cvs = isStr(cvs)? byId(cvs) : cvs
	if (cvs instanceof HTMLCanvasElement) {
		isNum(w) && (cvs.width =w)
		isNum(h) && (cvs.height=h)
		return [+cvs.width, +cvs.height]
	}
	return [0,0]
},
cvsFillRect = ctx=> (x, y, w, h, fill)=> {
	ctx.save()
	fill && (ctx.fillStyle = fill)
	fill === null
		? ctx.clearRect(x, y, w, h)
		: ctx.fillRect(x, y, w, h)
	ctx.restore()
},
cvsFillCircle = ctx=> (x, y, r, fill)=> {
	ctx.save()
	ctx.beginPath()
	fill === null
		? (ctx.globalCompositeOperation = 'destination-out')
		: (ctx.fillStyle = fill)
	ctx.arc(x, y, r, 0, PI*2)
	ctx.fill()
	ctx.restore()
},
cvsStrokeCircle = ctx=> (x, y, r, color, lw=1)=> {
	ctx.save()
	ctx.beginPath()
	color && (ctx.strokeStyle = color)
	ctx.arc(x, y, r, 0, PI*2)
	ctx.lineWidth = lw
	ctx.stroke()
	ctx.restore()
},
cvsStrokeLine = ctx=> (x1,y1,x2,y2)=> {
	ctx.beginPath()
	ctx.moveTo(x1, y1)
	ctx.lineTo(x2, y2)
	ctx.stroke()
},
cvsSetNewLinePath = (ctx,fill)=> (...c)=> {
	ctx.beginPath()
	cvsSetLinePath(ctx,fill)(...c)
},
cvsSetLinePath = (ctx,fill)=> (...c)=> {
	ctx.moveTo(c[0][0], c[0][1])
	for (let i=1; i<c.length; i++)
		ctx.lineTo(c[i][0], c[i][1])
	if (fill) {
		ctx.fillStyle = fill
		ctx.fill()
	}
},
cvsSetLineTo = ctx=> (...c)=> {
	for (let i=0; i<c.length; i++)
		ctx.lineTo(c[i][0], c[i][1])
}
class FadeOut {
	#count = 0
	#delay = 0
	#alpha = 1
	#duration = 0
	get alpha()   {return this.#alpha}
	get working() {return this.#alpha > 0}
	constructor(ms=1000, delay=0) {
		this.#duration = ms
		this.#delay = delay
	}
	update() {
		if (++this.#count * 1e3/60 < this.#delay) return
		this.#alpha = clamp(this.#alpha-1/(this.#duration/(1e3/60)), 0, 1)
		return this
	}
	setAlpha(ctx) {ctx.globalAlpha = this.#alpha}
}
class FadeIn {
	#count = 0
	#delay = 0
	#alpha = 0
	#duration = 0
	get alpha()   {return this.#alpha}
	get working() {return this.#alpha < 1}
	constructor(ms=1000, delay=0) {
		this.#duration = ms
		this.#delay = delay
	}
	update(max=1) {
		if (++this.#count * 1e3/60 < this.#delay) return
		if (!this.working) return
		this.#alpha = clamp(this.#alpha+max/(this.#duration/(1e3/60)), 0, max)
		return this
	}
	setAlpha(ctx) {ctx.globalAlpha = this.#alpha}
}
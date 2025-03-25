'use strict'
class CustomContext2D extends CanvasRenderingContext2D {
	/** @param {HTMLCanvasElement} canvas */
	constructor(canvas, options) {
		return Object.setPrototypeOf(canvas.getContext('2d',options), new.target.prototype)
	}
}
class ExtendedContext2D extends CustomContext2D {
	get width()  {return this.canvas.width}
	get height() {return this.canvas.height}
	/**
	 * @param {number} w
	 * @param {number} h
	 */
	resize(w, h=w) {
		const cvs = this.canvas
		isNum(w) && (cvs.width =w)
		isNum(h) && (cvs.height=h)
		return [cvs.width, cvs.height]
	}
	/** @param {CtxStyle} style */
	clear(style=null) {
		this.fillRect(0,0,this.width,this.height,style)
	}
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 */
	fillRect(x, y, w, h, style=this.fillStyle) {
		this.save()
		style && (this.fillStyle = style)
		style === null
			? this.clearRect(x, y, w, h)
			: super.fillRect(x, y, w, h)
		this.restore()
	}
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} radius
	 */
	fillCircle(x, y, radius, style=this.fillStyle) {
		this.save()
		this.beginPath()
		style === null
			? (this.globalCompositeOperation = 'destination-out')
			: (this.fillStyle = style)
		this.arc(x, y, radius, 0, PI*2)
		this.fill()
		this.restore()
	}
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} r
	 * @param {number} lineWidth
	 */
	strokeCircle(x, y, r, style=this.fillStyle, lineWidth=1) {
		this.save()
		this.beginPath()
		style && (this.strokeStyle = style)
		this.arc(x, y, r, 0, PI*2)
		this.lineWidth = lineWidth
		this.stroke()
		this.restore()
	}
	/**
	 * @param {number} x1
	 * @param {number} y1
	 * @param {number} x2
	 * @param {number} y2
	 */
	strokeLine(x1, y1, x2, y2) {
		this.beginPath()
		this.moveTo(x1, y1)
		this.lineTo(x2, y2)
		this.stroke()
	}
	/** @param {[x:number,y:number][]} c */
	newLinePath(...c) {
		this.beginPath()
		this.setLinePath(...c)
	}
	/** @param {[x:number,y:number][]} c */
	setLinePath(...c) {
		this.moveTo(c[0][0], c[0][1])
		for (let i=1; i<c.length; i++)
			this.lineTo(c[i][0], c[i][1])
	}
	/** @param {[x:number,y:number][]} c */
	addLinePath(...c) {
		for (let i=0; i<c.length; i++)
			this.lineTo(c[i][0], c[i][1])
	}
	/**
	 * @param {string|CanvasGradient|CanvasPattern} style
	 * @param {[x:number,y:number][]} c
	 */
	fillPolygon(style, ...c) {
		this.save()
		this.newLinePath(...c)
		this.fillStyle = style
		this.fill()
		this.restore()
	}
}
/**
 * @param {string|null} arg ID value of canvas
 * @param {number} w Set of canvas width
 * @param {number} h Set of canvas height
 */
const canvas2D = (arg, w, h=w)=> {
	let cvs = document.createElement('canvas')
	if (byId(arg) instanceof HTMLCanvasElement) cvs = byId(arg)
	const ctx  = new ExtendedContext2D(cvs)
	;([w,h]= ctx.resize(w,h))
	/** @type {[cvs,ctx,w:number,h:number]} */
	const vals = [cvs,ctx,w,h]
	return {cvs,ctx,w,h,vals}
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
	/** @param {ExtendedContext2D} ctx */
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
	/** @param {ExtendedContext2D} ctx */
	setAlpha(ctx) {ctx.globalAlpha = this.#alpha}
}
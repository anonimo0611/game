'use strict'
/** @typedef {string|CanvasGradient|CanvasPattern} CanvasStyle */

class ExtendedContext2D extends CanvasRenderingContext2D {
	/** @param {HTMLCanvasElement} cvs */
	constructor(cvs, opts={}) {
		try {super()} catch(e){}
		return Object.setPrototypeOf(cvs.getContext('2d',opts), new.target.prototype)
	}
	/** @returns {[width:number, height:number]} */
	get size()   {return [this.width, this.height]}
	get width()  {return this.canvas.width}
	get height() {return this.canvas.height}

	/**
	 * @param {number} [w]
	 * @param {number} [h]
	 */
	resize(w, h=w) {
		const cvs = this.canvas
		w != cvs.width  && typeof(w) == 'number' && w>=0 && (cvs.width =w)
		h != cvs.height && typeof(h) == 'number' && h>=0 && (cvs.height=h)
		return this
	}
	/** @param {CanvasStyle} [style] */
	clear(style) {
		this.fillRect(0,0,this.width,this.height,style??null)
		return this
	}
	setAlpha(alpha=this.globalAlpha) {
		this.globalAlpha = alpha
		return this
	}
	fillRect(
	 /**@type {number}*/x,
	 /**@type {number}*/y,
	 /**@type {number}*/w,
	 /**@type {number}*/h,
	 /**@type {?CanvasStyle}*/style=this.fillStyle
	) {
		this.save()
		style && (this.fillStyle = style)
		style === null
			? this.clearRect(x, y, w, h)
			: super.fillRect(x, y, w, h)
		this.restore()
	}
	fillCircle(
	 /**@type {number}*/x,
	 /**@type {number}*/y,
	 /**@type {number}*/radius,
	 /**@type {?CanvasStyle}*/style=this.fillStyle
	) {
		this.save()
		this.beginPath()
		style === null
			? (this.globalCompositeOperation = 'destination-out')
			: (this.fillStyle = style)
		this.arc(x, y, radius, 0, PI*2)
		this.fill()
		this.restore()
	}
	strokeCircle(
	 /**@type {number}*/x,
	 /**@type {number}*/y,
	 /**@type {number}*/r,
	 /**@type {CanvasStyle}*/style=this.fillStyle,
	 /**@type {number}*/lineWidth=1
	) {
		this.save()
		this.beginPath()
		style && (this.strokeStyle = style)
		this.arc(x, y, r, 0, PI*2)
		this.lineWidth = lineWidth
		this.stroke()
		this.restore()
	}
	strokeLine(
	 /**@type {number}*/x1,
	 /**@type {number}*/y1,
	 /**@type {number}*/x2,
	 /**@type {number}*/y2
	) {
		this.beginPath()
		this.moveTo(x1, y1)
		this.lineTo(x2, y2)
		this.stroke()
	}
	newLinePath(
	 /**@type {xyList[]}*/...c
	) {
		this.beginPath()
		this.setLinePath(...c)
		return this
	}
	setLinePath(
	 /**@type {xyList[]}*/...c
	) {
		c.forEach(([x,y], i)=> {
			!i ? this.moveTo(x,y)
			   : this.lineTo(x,y)
		})
		return this
	}
	addLinePath(
	 /**@type {xyList[]}*/...c
	) {
		c.forEach(([x,y])=> this.lineTo(x,y))
		return this
	}
	fillPolygon(
	 /**@type {CanvasStyle}*/style,
	 /**@type {xyList[]}*/...c
	) {
		this.save()
		this.newLinePath(...c)
		this.fillStyle = style
		this.fill()
		this.restore()
		return this
	}
}

class FadeIn {
	#count = 0
	#delay = 0
	#alpha = 0
	#duration = 0
	get alpha()   {return this.#alpha}
	get working() {return this.#alpha < 1}
	constructor(ms=500, delay=0) {
		this.#duration = ms
		this.#delay = delay
	}
	/**
	 * @param {number} max max alpha
	 * @returns {boolean} Determine if fade-in is in progress
	 */
	update(max=1) {
		if (++this.#count * Ticker.Interval < this.#delay || !this.working)
			return false
		const rate  = this.#duration / Ticker.Interval
		this.#alpha = clamp(this.#alpha+max/rate, 0, max)
		return this.working
	}
	/** @param {ExtendedContext2D} ctx */
	setAlpha(ctx) {
		ctx.globalAlpha = this.#alpha
		return this.working
	}
}
class FadeOut {
	#count = 0
	#delay = 0
	#alpha = 1
	#duration = 0
	get alpha()   {return this.#alpha}
	get working() {return this.#alpha > 0}
	constructor(ms=500, delay=0) {
		this.#duration = ms
		this.#delay = delay
	}
	/** @returns {boolean} Determine if fade-out is in progress */
	update() {
		if (++this.#count * Ticker.Interval < this.#delay)
			return false
		const rate  = this.#duration / Ticker.Interval
		this.#alpha = clamp(this.#alpha-1/rate, 0, 1)
		return this.working
	}
	/** @param {ExtendedContext2D} ctx */
	setAlpha(ctx) {
		ctx.globalAlpha = this.#alpha
		return this.working
	}
}

/**
 * @param {?string} id ID of a canvas that exists in the document; If the `null` or does not exist, the canvas is created
 * @param {number} [width]  The default value uses the width attribute of canvas element
 * @param {number} [height] The default is the same as `width`, but if both `width` and `height` are undefined, use the heigt attribute of canvas element
 */
const canvas2D = (id, width, height=width)=> {
	const cvs = id && byId(id) instanceof HTMLCanvasElement
		? /**@type {HTMLCanvasElement}*/(byId(id))
		: document.createElement('canvas')
	const ctx  = new ExtendedContext2D(cvs).resize(width,height)
	const [w,h]= ctx.size
	const vals = /**@type {readonly[cvs,ctx,w:number,h:number]}*/([cvs,ctx,w,h])
	return freeze({cvs,ctx,w,h,vals})
}
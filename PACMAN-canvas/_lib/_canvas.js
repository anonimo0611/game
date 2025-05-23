'use strict'
/** @typedef {string|CanvasGradient|CanvasPattern} CtxStyle */

class ExtendedContext2D extends CanvasRenderingContext2D {
	/** @param {HTMLCanvasElement} cvs */
	constructor(cvs, opts={}) {
		try {super()} catch(e){}
		return Object.setPrototypeOf(cvs.getContext('2d',opts), new.target.prototype)
	}
	/** @type {[x:number, y:number]} */
	get size()   {return [this.width, this.height]}
	get width()  {return this.canvas.width}
	get height() {return this.canvas.height}

	/**
	 * @param {number} [w]
	 * @param {number} [h]
	 */
	resize(w, h=w) {
		const cvs = this.canvas
		typeof(w) == 'number' && w>=0 && (cvs.width =w)
		typeof(h) == 'number' && h>=0 && (cvs.height=h)
		return this
	}

	/** @param {number} alpha */
	setAlpha(alpha=this.globalAlpha) {
		this.globalAlpha = alpha
		return this
	}

	/** @param {CtxStyle} [style] */
	clear(style) {
		this.fillRect(0,0,this.width,this.height,style??null)
		return this
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 * @param {?CtxStyle} style
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
	 * @param {?CtxStyle} style
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
	 * @param {CtxStyle} style
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
		return this
	}

	/** @param {[x:number,y:number][]} c */
	setLinePath(...c) {
		c.forEach(([x,y], i)=> {
			!i ? this.moveTo(x,y)
			   : this.lineTo(x,y)
		})
		return this
	}

	/** @param {[x:number,y:number][]} c */
	addLinePath(...c) {
		c.forEach(([x,y])=> this.lineTo(x,y))
		return this
	}

	/**
	 * @param {CtxStyle} style
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
	 * @returns {boolean} during fading in
	 */
	update(max=1) {
		if (++this.#count * 1e3/60 < this.#delay || !this.working) {
			return false
		}
		this.#alpha = clamp(this.#alpha+max/(this.#duration/(1e3/60)), 0, max)
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
	/** @returns {boolean} during fading out */
	update() {
		if (++this.#count * 1e3/60 < this.#delay) {
			return false
		}
		this.#alpha = clamp(this.#alpha-1/(this.#duration/(1e3/60)), 0, 1)
		return this.working
	}
	/** @param {ExtendedContext2D} ctx */
	setAlpha(ctx) {
		ctx.globalAlpha = this.#alpha
		return this.working
	}
}

/**
 * @param {string|null} id ID of a canvas that exists in the document; if null, the canvas is created
 * @param {number} [width]  The default value uses the width attribute of canvas element
 * @param {number} [height] The default is the same as `width`, but if both `width` and `height` are undefined, use the heigt attribute of canvas element
 */
const canvas2D = (id, width, height=width)=> {
	const cvs = (id && byId(id) instanceof HTMLCanvasElement)
		? /**@type {HTMLCanvasElement}*/(byId(id))
		: document.createElement('canvas'),
	ctx = new ExtendedContext2D(cvs).resize(width,height)
	{
		const [w,h]=ctx.size
		/** @type {[cvs,ctx,w:number,h:number]} */
		const vals = [cvs,ctx,w,h]
		return {cvs,ctx,w,h,vals}
	}
}
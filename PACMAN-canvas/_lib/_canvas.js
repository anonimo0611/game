'use strict'
/** @typedef {string|CanvasGradient|CanvasPattern} Cvs2DStyle */

class ExtendedContext2D extends CanvasRenderingContext2D {
	constructor(/**@type {HTMLCanvasElement}*/cvs, opts={}) {
		try {super()} catch(e){}
		return Object.setPrototypeOf(cvs.getContext('2d',opts), new.target.prototype)
	}
	get size()   {return ({w:this.width, h:this.height})}
	get width()  {return this.canvas.width}
	get height() {return this.canvas.height}

	/**
	 @param {number} [w]
	 @param {number} [h]
	*/
	resize(w, h=w) {
		const cvs = this.canvas
		w != cvs.width  && typeof(w) == 'number' && w>=0 && (cvs.width =w)
		h != cvs.height && typeof(h) == 'number' && h>=0 && (cvs.height=h)
		return this
	}

	setAlpha(alpha=this.globalAlpha) {
		this.globalAlpha = alpha
		return this
	}

	/**
	 @param {Cvs2DStyle} [style]
	*/
	clear(style) {
		this.fillRect(0,0, this.width, this.height, style ?? null)
		return this
	}
	init() {
		this.resize(0,0).clear()
		return this
	}

	/**
	 @param {number} x
	 @param {number} y
	 @param {number} w
	 @param {number} h
	 @param {?Cvs2DStyle} style
	*/
	fillRect(x,y, w,h, style=this.fillStyle) {
		this.save()
		style && (this.fillStyle = style)
		style === null
			? this.clearRect(x, y, w, h)
			: super.fillRect(x, y, w, h)
		this.restore()
		return this
	}

	/**
	 @param {number} x
	 @param {number} y
	 @param {number} radius
	 @param {?Cvs2DStyle} style
	*/
	fillCircle(x,y, radius, style=this.fillStyle) {
		this.save()
		this.beginPath()
		style === null
			? (this.globalCompositeOperation = 'destination-out')
			: (this.fillStyle = style)
		this.arc(x,y, radius, 0, PI*2)
		this.fill()
		this.restore()
		return this
	}

	/**
	 @param {number} x
	 @param {number} y
	 @param {number} r
	 @param {Cvs2DStyle} style
	 @param {number} lineWidth
	*/
	strokeCircle(x,y, r, style=this.strokeStyle, lineWidth=this.lineWidth) {
		this.save()
		this.beginPath()
		style && (this.strokeStyle = style)
		this.arc(x,y, r, 0, PI*2)
		this.lineWidth = lineWidth
		this.stroke()
		this.restore()
		return this
	}

	/**
	 @param {number} x
	 @param {number} y
	 @param {number} radiusX
	 @param {number} radiusY
	 @param {number} rotation
	 @param {number} stAngle
	 @param {number} edAngle
	 @param {?Cvs2DStyle}[fillStyle]
	 @param {Cvs2DStyle} [strokeStyle]
	 @param {number}     [lineWidth]
	 @param {boolean}    [closePath]
	*/
	setEllipse(x,y,radiusX,radiusY,rotation,stAngle,edAngle,
		fillStyle = this.fillStyle, strokeStyle,
		lineWidth = this.lineWidth, closePath=false
	) {
		this.save()
		this.beginPath()
		this.ellipse(x,y,radiusX,radiusY,rotation,stAngle,edAngle)
		closePath && this.closePath()
		if (fillStyle) {
			this.fillStyle = fillStyle
			this.fill()
		}
		if (strokeStyle) {
			this.strokeStyle = strokeStyle
			this.lineWidth = lineWidth
			this.stroke()
		}
		this.restore()
		return this
	}

	/**
	 @param {number} x1
	 @param {number} y1
	 @param {number} x2
	 @param {number} y2
	*/
	strokeLine(x1, y1, x2, y2) {
		this.beginPath()
		this.moveTo(x1, y1)
		this.lineTo(x2, y2)
		this.stroke()
		return this
	}

	/**
	 @param {(readonly [x:number, y:number])[]} path
	*/
	newLinePath(...path) {
		this.beginPath()
		this.setLinePath(...path)
		return this
	}

	/**
	 @param {(readonly [x:number, y:number])[]} path
	*/
	setLinePath(...path) {
		path.forEach(([x,y], i)=> {
			!i ? this.moveTo(x,y)
			   : this.lineTo(x,y)
		})
		return this
	}

	/**
	 @param {(readonly [x:number, y:number])[]} path
	*/
	addLinePath(...path) {
		path.forEach(([x,y])=> this.lineTo(x,y))
		return this
	}

	/**
	 @param {Cvs2DStyle} style
	 @param {(readonly [x:number, y:number])[]} path
	*/
	fillPolygon(style, ...path) {
		this.save()
		this.newLinePath(...path)
		this.fillStyle = style
		this.closePath()
		this.fill()
		this.restore()
		return this
	}
}

class Fade {
    /** @readonly */static IN  = 0
    /** @readonly */static OUT = 1
	static in (dur=500, delay=0) {return new Fade(dur,delay,Fade.IN)}
	static out(dur=500, delay=0) {return new Fade(dur,delay,Fade.OUT)}

	#type  = /**@type {0|1}*/(0)
	#dur   = 0
	#delay = 0
	#count = 0
	#alpha = 0

	get type()    {return this.#type}
	get alpha()   {return this.#alpha}
	get running() {return this.#type == 0 ? this.#alpha<1 : this.#alpha>0}

	/**
	 @private
	 @param {number} duration
	 @param {number} delay
	 @param {0|1} type Fade.IN or Fade.OUT
	*/
	constructor(duration, delay, type=Fade.IN) {
		this.#type  = type
		this.#alpha = type
		this.#dur   = duration
		this.#delay = delay
	}

	/**
	 @param {number} maxAlpha
	 @returns {boolean} Whether the fade animation is currently active
	*/
	update(maxAlpha=1) {
		this.#count += Ticker.Interval
		if (this.#count < this.#delay) return true
		const step	= (maxAlpha/(this.#dur/Ticker.Interval))
		this.#alpha = this.#type == Fade.IN
			? Math.min(this.#alpha+step, maxAlpha)
			: Math.max(this.#alpha-step, 0)
		return this.running
	}

	/**
	 @param {CanvasRenderingContext2D} ctx
	*/
	apply(ctx) {ctx.globalAlpha = this.#alpha}
}

/**
 @param {?string} id The ID of an existing canvas element. If null or not found, a new canvas is created.
 @param {number} [width]  The desired width. Defaults to the element's attribute if omitted.
 @param {number} [height] The desired height. Defaults to `width` if provided; otherwise, defaults to the element's attribute.
*/
const canvas2D = (id, width, height=width)=> {
	const cvs = id && byId(id) instanceof HTMLCanvasElement
		? /**@type {HTMLCanvasElement}*/(byId(id))
		: document.createElement('canvas')
	const ctx  = new ExtendedContext2D(cvs).resize(width,height)
	const {w,h}= ctx.size
	const vals = /**@type {readonly[cvs,ctx,w:number,h:number]}*/([cvs,ctx,w,h])
	return /**@type {const}*/({cvs,ctx,w,h,vals})
}
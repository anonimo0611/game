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

	/** @param {Cvs2DStyle} [style] */
	clear(style) {
		this.fillRect(0,0, this.width, this.height, style ?? null)
		return this
	}
	init() {
		this.resize(0,0).clear()
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
	}

	/**
	 @param {number} x
	 @param {number} y
	 @param {number} rX  radiusX
	 @param {number} rY  radiusY
	 @param {number} rot rotaion
	 @param {number} st  startAngle
	 @param {number} ed  endAngle
	 @param {?Cvs2DStyle} [fill]   fillStyle
	 @param {Cvs2DStyle}  [stroke] storkeStyle
	 @param {number}  [lw]    lineWIdth
	 @param {boolean} [close] Close the path
	*/
	setEllipse(x,y,rX,rY,rot,st,ed,fill=this.fillStyle,stroke,lw=this.lineWidth,close=false
	) {
		this.save()
		this.beginPath()
		this.ellipse(x,y,rX,rY,rot,st,ed)
		close && this.closePath()
		if (fill) {
			this.fillStyle = fill
			this.fill()
		}
		if (stroke) {
			this.strokeStyle = stroke
			this.lineWidth = lw
			this.stroke()
		}
		this.restore()
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
	}

	/** @param {readonly number[]} v */
	setVertices(v) {
		for (const i of range(0, v.length, 2))
			!i ? this.moveTo(v[i], v[i+1])
			   : this.lineTo(v[i], v[i+1])
		return this
	}

	/** @param {(readonly [x:number, y:number])[]} c */
	newLinePath(...c) {
		this.beginPath()
		this.setLinePath(...c)
		return this
	}

	/** @param {(readonly [x:number, y:number])[]} c */
	setLinePath(...c) {
		c.forEach(([x,y], i)=> {
			!i ? this.moveTo(x,y)
			   : this.lineTo(x,y)
		})
		return this
	}

	/** @param {(readonly [x:number, y:number])[]} c */
	addLinePath(...c) {
		c.forEach(([x,y])=> this.lineTo(x,y))
		return this
	}

	/**
	 @param {Cvs2DStyle} style
	 @param {(readonly [x:number, y:number])[]} c
	*/
	fillPolygon(style, ...c) {
		this.save()
		this.newLinePath(...c)
		this.fillStyle = style
		this.fill()
		this.restore()
	}
}

class Fade {
	/** @readonly */
	static Type = /**@type {const}*/({IN:0, OUT:1})
	static in (dur=500, delay=0) {return new Fade(dur,delay,Fade.Type.IN)}
	static out(dur=500, delay=0) {return new Fade(dur,delay,Fade.Type.OUT)}
	#type; #delay; #duration
	#count = 0
	#alpha = 0

	/**
	 @private
	 @param {number} dur
	 @param {number} delay
	 @param {0|1} type
	*/
	constructor(dur, delay, type=Fade.Type.IN) {
		this.#delay    = delay
		this.#duration = dur
		this.#type = this.#alpha = type
	}
	get working()	{return this.isInMode? this.#alpha<1 : this.#alpha>0}
	get alpha() 	{return this.#alpha}
	get isInMode()	{return this.#type == Fade.Type.IN}
	get isOutMode() {return this.#type == Fade.Type.OUT}

	/**
	 @param {number} maxAlpha
	 @returns {boolean}
	*/
	update(maxAlpha=1) {
		this.#count += Ticker.Interval
		if (this.#count < this.#delay) return true
		const step	= (maxAlpha/(this.#duration/Ticker.Interval))
		this.#alpha = this.isInMode
			? Math.min(this.#alpha+step, maxAlpha)
			: Math.max(this.#alpha-step, 0)
		return this.working
	}
	/** @param {CanvasRenderingContext2D} ctx */
	apply(ctx) {
		ctx.globalAlpha = this.#alpha
	}
}

/**
 @param {?string} id ID of a canvas that exists in the document; If the `null` or does not exist, the canvas is created
 @param {number} [width]  The default value uses the width attribute of canvas element
 @param {number} [height] The default is the same as `width`, but if both `width` and `height` are undefined, use the heigt attribute of canvas element
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
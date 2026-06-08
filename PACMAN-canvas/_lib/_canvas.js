'use strict'
class EnhancedCtx2D extends CanvasRenderingContext2D {
	constructor(/**@type {HTMLCanvasElement}*/cvs, opts={}) {
		try {super()} catch(e){}
		return Object.setPrototypeOf(cvs.getContext('2d',opts), new.target.prototype)
	}
	get size()   {return {w:this.width, h:this.height}}
	get width()  {return this.canvas.width}
	get height() {return this.canvas.height}

	void() {}

	/**
	 @param {HTMLImageElement|HTMLCanvasElement} img
	 @param {Position} centerPos
	 @param {number}   [alpha]
	 @param {?number}  [ox] Default: -img.width  / 2
	 @param {?number}  [oy] Default: -img.height / 2
	*/
	put(img, centerPos, alpha, ox,oy, scaleX=1,scaleY=1, rotate=0) {
		const {width:w,height:h}= img
		this.save()
		this.setAlpha(alpha)
		this.translate(centerPos)
		this.rotate(rotate)
		this.scale(scaleX, scaleY)
		this.drawImage(img, (ox ?? -w/2), (oy ?? -h/2))
		this.restore()
	}

	/**
	 @param {number} [w]
	 @param {number} [h]
	*/
	resize(w, h=w) {
		const cvs = this.canvas
		typeof(w) == 'number' && w>=0 && (cvs.width =w|0)
		typeof(h) == 'number' && h>=0 && (cvs.height=h|0)
		return this
	}

	setAlpha(alpha=this.globalAlpha) {
		this.globalAlpha = alpha
		return this
	}

	/**
	 @overload
	 @param   {number}  x
	 @param   {number} [y]
	 @returns {this}

	 @overload
	 @param   {Position} pos
	 @returns {this}

	 @param {number|Position} v1
	 @param {number} [v2]
	*/
	translate(v1, v2) {
		if (typeof v1 == 'object') super.translate(v1.x, v1.y)
		if (typeof v1 == 'number') super.translate(v1, v2 ?? v1)
		return this
	}

	/**
	 @param {number}  x
	 @param {number} [y]
	*/
	scale(x, y=x) {
		super.scale(x, y)
		return this
	}

	/** @param {CvsStyle} [style] */
	clear(style) {
		this.fillRect(0,0, this.width, this.height, style ?? null)
		return this
	}

	/**
	 @param {number} x
	 @param {number} y
	 @param {number} w
	 @param {number} h
	 @param {?CvsStyle} style
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
	 @param {number} r
	 @param {CvsStyle} [style]
	*/
	fillCircle(x,y, r, style=this.fillStyle) {
		this.save()
		this.beginPath()
		style && (this.fillStyle = style)
		this.arc(x,y, r, 0, PI*2)
		this.fill()
		this.restore()
		return this
	}

	/**
	 @param {number} x
	 @param {number} y
	 @param {number} r
	 @param {CvsStyle} style
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

	/** @param {(readonly [x:number, y:number])[]} path */
	newLinePath(...path) {
		this.beginPath()
		this.setLinePath(...path)
		return this
	}

	/** @param {(readonly [x:number, y:number])[]} path */
	setLinePath(...path) {
		path.forEach(([x,y], i)=> {
			!i ? this.moveTo(x,y)
			   : this.lineTo(x,y)
		})
		return this
	}

	/** @param {(readonly [x:number, y:number])[]} path */
	addLinePath(...path) {
		path.forEach(([x,y])=> this.lineTo(x,y))
		return this
	}

	/**
	 @param {?CvsStyle} style
	 @param {(readonly [x:number, y:number])[]} path
	*/
	fillPolygon(style, ...path) {
		this.save()
		this.newLinePath(...path)
		this.closePath()
		style && (this.fillStyle = style)
		this.fill()
		this.restore()
		return this
	}
}

class Fade {
	/** @readonly */ static IN  = 0
	/** @readonly */ static OUT = 1
	static in (dur=500, delay=0) {return new Fade(dur, delay, 0)}
	static out(dur=500, delay=0) {return new Fade(dur, delay, 1)}

	#et=0; #type; #dur; #delay; #alpha;
	/**
	 @private
	 @param {number} duration
	 @param {number} delay
	 @param {0|1} type
	*/
	constructor(duration, delay, type=Fade.IN) {
		this.#type	= type
		this.#dur	= duration
		this.#delay = delay
		this.#alpha = (type == Fade.IN) ? 0:1
	}
	get alpha()   {return this.#alpha}
	get type()	  {return this.#type}
	get isIn()	  {return this.#type == Fade.IN}
	get isOut()   {return this.#type == Fade.OUT}
	get running() {return this.#et < (this.#delay+this.#dur)}

	/**
	 @param   {number} maxAlpha  maximum opacity
	 @param   {number} deltaTime elapsed time since last update(in ms)
	 @returns {boolean} Whether the fade animation is currently active
	*/
	update(maxAlpha=1, deltaTime=1000/60) {
		this.#et += deltaTime
		if (this.#et < this.#delay) {
			this.#alpha = (this.#type == Fade.IN)? 0:maxAlpha
			return true
		}
		const prog = Math.min((this.#et-this.#delay)/this.#dur, 1)
		this.#type == Fade.IN
			? (this.#alpha = prog*maxAlpha)
			: (this.#alpha = (1-prog)*maxAlpha)
		return this.running
	}

	/** @param {CanvasRenderingContext2D} ctx */
	apply(ctx) {ctx.globalAlpha = this.#alpha}
}

/** @param {string|Path2D} [path] */
const path2D = path=> new Path2D(path)

/**
 @param {?string} id      The ID of an existing canvas element. If null or not found, a new canvas is created.
 @param {number} [width]  The desired width. Defaults to the element's attribute if omitted.
 @param {number} [height] The desired height. Defaults to `width` if provided; otherwise, defaults to the element's attribute.
*/
const canvas2D = (id, width, height=width)=> {
	const elm  = id? document.getElementById(id) : null
	const cvs  = (elm instanceof HTMLCanvasElement)? elm : document.createElement('canvas')
	const ctx  = new EnhancedCtx2D(cvs), {w,h}= ctx.resize(width,height).size
	const vals = /**@type {readonly [cvs,ctx,w:number,h:number]}*/([cvs,ctx,w,h])
	return /**@type {const}*/({cvs,ctx,w,h,vals})
}
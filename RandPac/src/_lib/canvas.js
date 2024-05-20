'use strict';
const canvas2D = (id, width, height=width)=> {
	const cvs = byId(id) ?? document.createElement('canvas');
	const ctx = cvs.getContext('2d');
	ctx.clear = (x=0,y=0,w=cvs.width,h=cvs.height)=> ctx.clearRect(x,y,w,h);
	({width,height}= setCanvasSize(cvs)(width,height));
	return {cvs,ctx,width,height,vals:[cvs,ctx,width,height]};
};
const setCanvasSize = param=> (width, height=width)=> {
	const cvs = (isStr(param)? byId(param) : param) || {};
	if (typeOf(cvs) == 'HTMLCanvasElement') {
		isNum(width)  && (cvs.width  = width);
		isNum(height) && (cvs.height = height);
	}
	return {width:cvs.width || 0, height:cvs.height || 0}
};
const setCtxColors = (...ctxs)=> ({fill, stroke})=> {
	for (const ctx of ctxs) {
		isStr(fill)   && (ctx.fillStyle   = fill);
		isStr(stroke) && (ctx.strokeStyle = stroke);
	}
};
const measureTextWidth = (txt, font)=> {
	const ctx = canvas2D(null).ctx;
	ctx.font = font;
	return ctx.measureText(txt).width;
};
const fillRect = ctx=> (x, y, w, h, fill)=> {
	ctx.save();
	isStr(fill) && (ctx.fillStyle = fill);
	(fill === null)
		? ctx.clearRect(x, y, w, h)
		: ctx.fillRect(x, y, w, h);
	ctx.restore();
};
const fillCircle = ctx=> (x, y, r, fill)=> {
	ctx.save();
	ctx.beginPath();
	(fill === null)
		? (ctx.globalCompositeOperation = 'destination-out')
		: isStr(fill) && (ctx.fillStyle = fill);
	ctx.arc(x, y, r, 0, PI*2);
	ctx.fill();
	ctx.restore();
};
const createRoundRectPath = ctx=> (x, y, w, h, r)=> {
	ctx.save();
	ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(w-r, 0);
    ctx.arc(w-r, r, r, -PI/2, 0);
    ctx.lineTo(w, h-r);
    ctx.arc(w-r, h-r, r, 0, PI/2);
    ctx.lineTo(r, h);
    ctx.arc(r, h-r, r, PI/2, PI);
    ctx.lineTo(0, r);
    ctx.arc(r, r, r, PI, -PI/2);
    ctx.closePath();
	ctx.restore();
};
const strokeRoundRect = ctx=> (x, y, w, h, r, {color,lw=1})=> {
	ctx.save();
 	ctx.lineWidth = lw;
	isStr(color) && (ctx.strokeStyle = color);
	createRoundRectPath(ctx)(x, y, w, h, r);
    ctx.stroke();
	ctx.restore();
};

class FadeOut {
	#count = 0;
	#delay = 0;
	#alpha = 1;
	#duration;
	constructor(ms=1000, delay=0) {
		this.#duration = ms;
		this.#delay = delay;
	}
	update(ctx) {
		if (++this.#count * 1000/60 < this.#delay) return;
		this.#alpha = clamp(this.#alpha-1/(this.#duration/(1000/60)), 0, 1);
		ctx.globalAlpha = this.#alpha;
		return this;
	}
	get alpha()   {return this.#alpha}
	get working() {return this.#alpha > 0}
}
class FadeIn {
	#count = 0;
	#delay = 0;
	#alpha = 0;
	#duration;
	constructor(ms=1000, delay=0) {
		this.#duration = ms;
		this.#delay = delay;
	}
	update(ctx) {
		if (++this.#count * 1000/60 < this.#delay) return;
		if (!this.working) return;
		this.#alpha = clamp(this.#alpha+1/(this.#duration/(1000/60)), 0, 1);
		ctx.globalAlpha = this.#alpha;
		return this;
	}
	get alpha()   {return this.#alpha}
	get working() {return this.#alpha < 1}
}
'use strict';
const canvas2D = (id, w, h=w)=> {
	const cvs = byId(id) ?? document.createElement('canvas');
	const ctx = cvs.getContext('2d');
	if (typeOf(w) == 'HTMLCanvasElement')
		({width:w,height:h}= w);
	({w,h}= setCanvasSize(cvs)(w,h));
	ctx.clear = (x=0,y=0,w=cvs.width,h=cvs.height)=> ctx.clearRect(x,y,w,h);
	return {cvs,ctx,width:w,height:h,vals:[cvs,ctx,w,h]};
}
const setCanvasSize = param=> (w, h=w)=> {
	const cvs = (isStr(param)? byId(param) : param) || {};
	if (typeOf(cvs) == 'HTMLCanvasElement') {
		isNum(w) && (cvs.width  = w);
		isNum(h) && (cvs.height = h);
	}
	return {
		width: cvs.width  || 0,
		height:cvs.height || 0}
}
const createRoundRectPath = (ctx, x, y, w, h, r)=> {
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
}
const fillRoundRect = (ctx, x, y, w, h, r, color)=> {
 	ctx.fillStyle = color;
	createRoundRectPath(ctx, x, y, w, h, r);
    ctx.fill();
}
const strokeRoundRect = (ctx, x, y, w, h, r, color)=> {
 	ctx.strokeStyle = color;
	createRoundRectPath(ctx, x, y, w, h, r);
    ctx.stroke();
}
const fillCircle = ctx=> (x, y, r, fill)=> {
	ctx.save();
	ctx.beginPath();
	fill && (ctx.fillStyle = fill);
	ctx.arc(x, y, r, 0, PI*2);
	ctx.fill();
	ctx.restore();
}
const strokeCircle = ctx=> (x, y, r, lw, style)=> {
	ctx.save();
	ctx.beginPath();
	style && (ctx.strokeStyle = style);
	ctx.lineWidth = lw;
	ctx.arc(x, y, r, 0, PI*2);
	ctx.stroke();
	ctx.restore();
}
const drawLine = (ctx,{color,width}={})=> (x1,y1, x2,y2)=> {
	ctx.save();
	color && (ctx.strokeStyle=color);
	isNum(width) && width>=0 && (ctx.lineWidth=width);
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
	ctx.restore();
}
const canvas2D = (id, width, height=width)=> {
	const cvs = byId(id) ?? document.createElement('canvas');
	const ctx = cvs.getContext('2d');
	ctx.clear = (x=0,y=0,w=cvs.width,h=cvs.height)=> ctx.clearRect(x,y,w,h);
	({width,height}= setCanvasSize(cvs)(width,height));
	return {cvs,ctx,width,height,vals:[cvs,ctx,width,height]};
}
const setCanvasSize = param=> (width, height=width)=> {
	const cvs = (isStr(param)? byId(param) : param) || {};
	if (typeOf(cvs) == 'HTMLCanvasElement') {
		isNum(width)  && (cvs.width  = width);
		isNum(height) && (cvs.height = height);
	}
	return {width:cvs.width || 0, height:cvs.height || 0}
}
const createRoundRectPath = (ctx, x, y, w, h, r)=> {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.arc(x+w-r, y+r, r, Math.PI * (3/2), 0, false);
    ctx.lineTo(x+w, y+h-r);
    ctx.arc(x+w-r, y+h-r, r, 0, Math.PI * (1/2), false);
    ctx.lineTo(x+r, y+h);
    ctx.arc(x+r, y+h-r, r, Math.PI * (1/2), Math.PI, false);
    ctx.lineTo(x, y+r);
    ctx.arc(x+r, y+r, r, Math.PI, Math.PI * (3/2), false);
    ctx.closePath();
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
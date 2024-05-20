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
const fillCircle = ctx=> (x, y, r, fill)=> {
	ctx.save();
		ctx.beginPath();
		fill && (ctx.fillStyle=fill);
		ctx.arc(x, y, r, 0, PI*2);
		ctx.fill();
	ctx.restore();
};
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
const polygonPath = ctx=> (...v)=> {
	ctx.beginPath();
	ctx.moveTo(v[0], v[1]);
	for (let i=2; i<v.length; i+=2)
		ctx.lineTo(v[i], v[i+1]);
	ctx.closePath();
};
const textWidth = ctx=> (txt, font)=> {
	ctx.font = font;
	return txt? ctx.measureText(txt).width : 0;
};
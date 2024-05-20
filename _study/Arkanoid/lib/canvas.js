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
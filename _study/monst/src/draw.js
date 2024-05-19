import {Ticker}  from '../lib/timer.js';
import {cvs,ctx} from './canvas.js';

export function drawShadow(radius, {x, y}={}, {r,g,b,a}={}) {
	y += radius;
	ctx.save();
	ctx.translate(x, y);
	ctx.scale(1, .5);
	ctx.beginPath();
	ctx.arc(0, 0, radius, 0, PI*2);
	ctx.fillStyle = `rgba(0 0 0 /${a * .5})`;
	ctx.fill();
	ctx.restore();
}

export function drawBall(radius, {x, y}={}, {r,g,b,a}={}) {
	y += sin(Ticker.count * PI*2 / 60) * radius / 8;
	ctx.save();
	ctx.translate(x, y);
	ctx.beginPath();
	const BallGrad = ctx.createRadialGradient(0,0,0,0,0, radius);
	      BallGrad.addColorStop(0.0, `rgba(255 255 255 /${a})`);
	      BallGrad.addColorStop(1.0, `rgba(${r}% ${g}% ${b}% /${a})`);
	ctx.arc(0, 0, radius, 0, PI*2);
	ctx.fillStyle = BallGrad;
	ctx.fill();
	ctx.restore();
}

export function drawNumber(str, {x, y}, fs, color) {
	ctx.save();
	ctx.font = `${fs}px Digit`;
	const  w = ctx.measureText(str).width;
	const _y = y + fs / 3;
	ctx.lineWidth	= 4;
	ctx.strokeStyle = '#333';
	ctx.strokeText(str, x - w/2, _y);

	ctx.fillStyle = color;
	ctx.fillText(str, x - w/2, _y);
	ctx.restore();
}

export function drawBar(val, maxVal, lstVal, {x, y}, size, lColor, rColor) {
	ctx.save();
	const Grad = ctx.createLinearGradient(0, size.y, size.x, size.y);
	      Grad.addColorStop(0.0, lColor);
	      Grad.addColorStop(1.0, rColor);
	ctx.translate(x - size.x/2, y - size.y/2);
	{
		const lw = 2;
		ctx.lineWidth = lw;
		ctx.fillStyle = '#333';
		ctx.fillRect(-lw, -lw, size.x + (lw*2), size.y + (lw*2));
	}
	{
		const sx = lstVal / maxVal;
		ctx.fillStyle = '#f66';
		ctx.fillRect(0, 0, size.x*sx, size.y);
	}
	{
		const sx = val / maxVal;
		ctx.fillStyle = Grad;
		ctx.fillRect(0, 0, size.x*sx, size.y);
	}
	ctx.restore();
}

export function drawBorderedFont({
		ctx, text='', x=0, y=0,
		shadowBlur,
		shadowColor,
		shadowOffsetX,
		shadowOffsetY,
		lineWidth	= 1,
		strokeStyle = 1,
		align       = 'left',
		font        = 'sans-serif',
		fillStyle   = 'white',
	}={})
{
	ctx.save();
	shadowBlur  && (ctx.shadowBlur  = shadowBlur);
	shadowColor && (ctx.shadowColor = shadowColor);
	isNum(shadowOffsetX) && (ctx.shadowOffsetX = shadowOffsetX);
	isNum(shadowOffsetY) && (ctx.shadowOffsetY = shadowOffsetY);

	ctx.font = font;
	ctx.textAlign = align;

	ctx.lineWidth   = lineWidth;
	ctx.strokeStyle = strokeStyle;
	ctx.strokeText(text, x, y);

	ctx.fillStyle = fillStyle;
	ctx.fillText(text, x, y);
	ctx.restore();
}
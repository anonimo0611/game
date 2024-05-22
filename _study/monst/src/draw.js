import {Ticker}  from '../lib/timer.js';
import {cvs,ctx} from './canvas.js';

export const Draw = new class{
	shadow({x,y,radius,color,alpha=1}={}, shakePos=vec2(0,0))
	{
		const pos = vec2(x,y).add(shakePos);
		ctx.save();
		ctx.globalAlpha = alpha*0.5;
		ctx.translate(pos.x, pos.y+radius);
		ctx.scale(1, .5);
		ctx.beginPath();
			ctx.fillStyle = 'black';
			ctx.arc(0, 0, radius, 0, PI*2);
		ctx.fill();
		ctx.restore();
	}
	ball({x,y,clash,radius,color,alpha=1}={}, shakePos=vec2(0,0))
	{
		const pos  = vec2(x,y).add(shakePos);
		const grad = ctx.createRadialGradient(0,0,0, 0,0,radius);
		grad.addColorStop(0.0, 'white');
		grad.addColorStop(1.0, clash? '#DA70D6' : color);

		pos.y += sin(Ticker.count * PI*2 / 60) * radius/8;
		ctx.save();
		ctx.globalAlpha = alpha;
		ctx.translate(...pos.vals);
		ctx.beginPath();
			ctx.fillStyle = grad;
			ctx.arc(0,0, radius, 0, PI*2);
		ctx.fill();
		ctx.restore();
	}
	number(str, fs, color, {x, y})
	{
		ctx.save();
		ctx.font = `${fs}px Digit`;
		const tw = ctx.measureText(str).width;
		const dy = y + fs/3;
		{ // outline
			ctx.lineWidth	= 4;
			ctx.strokeStyle = '#333';
			ctx.strokeText(str, x - tw/2, dy);
		}
		{ // fill
			ctx.fillStyle = color;
			ctx.fillText(str, x - tw/2, dy);
		}
		ctx.restore();
	}
	hpBar({hp,lstHp,MaxHp}, {pos,size,lColor,rColor})
	{
		const Grad = ctx.createLinearGradient(0, size.y, ...size.vals);
		Grad.addColorStop(0.0, lColor);
		Grad.addColorStop(1.0, rColor);

		ctx.save();
		ctx.translate(
			pos.x - size.x/2,
			pos.y - size.y/2
		);
		{ // frame
			const lw = 2;
			ctx.fillStyle = '#333';
			ctx.fillRect(-lw, -lw, size.x + lw*2, size.y + lw*2);
		}
		{ // damaging
			const sx = lstHp / MaxHp;
			ctx.fillStyle = '#F66';
			ctx.fillRect(0,0, size.x*sx, size.y);
		}
		{ // current hp
			const sx = hp / MaxHp;
			ctx.fillStyle = Grad;
			ctx.fillRect(0,0, size.x*sx, size.y);
		}
		ctx.restore();
	}
	message({
		x = cvs.width /2,
		y = cvs.height/2 + 20,
		lineWidth	= 4,
		strokeStyle = 1,
		text        = '',
		textAlign   = 'center',
		font        = '40px Atari',
		fillStyle   = 'white',
	}={})
	{
		if (!text) return;
		ctx.save();
		ctx.font = font;
		ctx.textAlign = textAlign;
		{ // outline
			ctx.lineWidth   = lineWidth;
			ctx.strokeStyle = strokeStyle;
			ctx.strokeText(text, x, y);
		}
		{ // fill
			ctx.fillStyle = fillStyle;
			ctx.fillText(text, x, y);
		}
		ctx.restore();
	}
};
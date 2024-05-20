const DisDuration  = 1149/Ticker.Interval;
const LineDuration =  300/Ticker.Interval;
const FadeDuration =  300/Ticker.Interval;

import {Ticker} from '../_lib/timer.js';
import {Color}  from '../maze.js';
export class Losing {
	constructor(ctx, param) {freeze(this)}
	#angle   = 0;
	#lineA   = 1;
	StRadius = A / 4.0;
	EdRadius = A / 2.3;
	#innerR  = A / 9.6;
	#outerR  = this.StRadius;
	draw(ctx, x,y, {Radius}) {
		x = clamp(x, Radius, CVS_SIZE-Radius);
 		this.#angle < PI - PI/DisDuration
 			? this.#disappear(ctx, x,y, Radius)
	 		: this.#drawLines(ctx, x,y);
	}
	#disappear(ctx, x,y, Radius) {
		const angle = this.#angle += PI/DisDuration;
		ctx.save();
		ctx.translate(x, y);
		ctx.beginPath();
			ctx.fillStyle = Color.PacMan;
			ctx.moveTo(0, Radius*0.35);
			ctx.arc(0,0, Radius, -PI/2-angle,-PI/2+angle, true);
		ctx.fill();
		ctx.restore();
	}
	#drawLines(ctx, x,y) {
		const {StRadius,EdRadius}= this;
		const innerR = min(this.#innerR += StRadius/LineDuration, StRadius);
		const outerR = min(this.#outerR += EdRadius/LineDuration, EdRadius);
		ctx.save();
		ctx.translate(x, y);
		if (this.#outerR >= EdRadius)
			ctx.globalAlpha = max(this.#lineA -= 1/FadeDuration, 0);
		for (let deg=0; deg<360; deg+=360/10) {
			ctx.beginPath();
				ctx.lineWidth   = A/12;
				ctx.strokeStyle = Color.PacMan;
		 		ctx.moveTo(...getCircumPos(deg, innerR, 0, A/24));
		        ctx.lineTo(...getCircumPos(deg, outerR, 0, A/24));
	        ctx.stroke();
		}
		ctx.restore();
	}
}
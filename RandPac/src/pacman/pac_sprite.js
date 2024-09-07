import {Ticker}  from '../_lib/timer.js';
import {U,R,D,L} from '../_lib/direction.js';
import {Color}   from '../maze.js';
import {Losing}  from './losing.js';

const Duration = 150/Ticker.Interval;
const MouthMax =  90 * PI/180;
const MouthMin =  20 * PI/180;
const MouthMid =  60 * PI/180;
const AngleMap = new Map([[L,0],[U,1],[R,2],[D,3]]);

export class Sprite {
	#obj     = null;
	#losing  = null;
	#rad     =  0;
	#animDir = -1;
	constructor(obj, {closed=true}={}) {
		this.#obj = obj;
		this.#rad = closed? MouthMax : MouthMid;
	}
	get angle() {
		return (this.#obj?.stayStill ? MouthMax : this.#rad);
	}
	update() {
		if (this.#obj?.stayStill
		 || this.#obj?.stopped && this.#rad < MouthMid) return;
		if (this.#rad < MouthMin
		 || this.#rad > MouthMax) this.#animDir *= -1;
		this.#rad += (MouthMax - MouthMin)/Duration * this.#animDir;
	}
	draw(ctx, {x,y}) {
		const {orient=L,Radius,fadeIn}= this.#obj;
		if (this.#losing) {
			this.#losing.draw(ctx, x,y, this.#obj);
			return;
		}
		ctx.save();
		fadeIn?.update(ctx);
	 	ctx.translate(x, y);
		ctx.rotate(AngleMap.get(orient) * PI/2);
		ctx.beginPath();
			ctx.fillStyle = Color.PacMan;
			ctx.moveTo(Radius*0.35, 0);
			ctx.arc(0,0, Radius, -PI/2-this.angle, PI/2+this.angle);
		ctx.fill();
		ctx.restore();
	}
	setLosing() {
		this.#losing = new Losing();
	}
}
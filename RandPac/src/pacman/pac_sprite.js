import {Ticker}  from '../_lib/timer.js';
import {U,R,D,L} from '../_lib/direction.js';
import {Color}   from '../maze.js';
import {Losing}  from './losing.js';

const Duration  = 150/Ticker.Interval;
const OpenMid   = 30 * PI/180
const OpenMax   = 60 * PI/180
const RotateMap = new Map([[R,0],[D,1],[L,2],[U,3]]);

export class Sprite {
	#obj     = null;
	#losing  = null;
	#mouth   =  0;
	#animDir = -1;
	constructor(obj, {closed=true}={}) {
		this.#obj = obj;
		this.#mouth = closed? 0 : OpenMid;
	}
	get mouthAngle() {
		return (this.#obj?.stayStill ? 0 : this.#mouth);
	}
	update() {
		if (this.#obj?.stayStill
		 || this.#obj?.stopped && this.#mouth > OpenMid) return;
		 const dir = between(this.mouthAngle, 0, OpenMax) ? 1 : -1;
		 this.#mouth += OpenMax/Duration * (this.#animDir*=dir);
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
		ctx.rotate(RotateMap.get(orient) * PI/2);
		ctx.beginPath();
			ctx.fillStyle = Color.PacMan;
			ctx.moveTo(-Radius*0.35, 0);
			ctx.arc(0,0, Radius, this.mouthAngle, PI*2-this.mouthAngle);
		ctx.fill();
		ctx.restore();
	}
	setLosing() {
		this.#losing = new Losing();
	}
}
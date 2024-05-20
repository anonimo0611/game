import {Scene} from './scene.js';
import {cvs,ctx,cvsForBunker} from './_canvas.js';

const Width   = cvs.width / 8;
const Height  = Width / 1.5;
const Bunkers = Array(4).fill();

export class Bunker {
	static cvs    = cvsForBunker;
	static ctx    = this.cvs.getContext('2d',{willReadFrequently:true});
	static Width  = Width;
	static Height = Height;
	static Top    = cvs.height * 3/4;
	static Bottom = this.Top + this.Height;
	static collision(obj, fromUpper) {
		return !!Bunkers.find(b=> collisionRect(obj, b)
			&& b.collision(obj.tipPos, fromUpper));
	}
	static init() {
		Bunker.ctx.clearRect(0,0,cvs.width,cvs.height);
		Bunker.ctx.globalCompositeOperation = 'source-over';
		for (const i of Bunkers.keys())		
			Bunkers[i] = new Bunker(i);
		Bunker.ctx.globalCompositeOperation = 'destination-out';
	}
	static draw() {
		ctx.drawImage(Bunker.cvs, 0,0);
	}
	constructor(i) {
		this.x      = (Width*3/4) + (i*Width) + ((i*Width)*3/4);
		this.y      = Bunker.Top;
		this.ctx    = Bunker.ctx;
		this.Pos    = vec2(this.x, this.y);
		this.Width  = Width;
		this.Height = Height;
		this.#cache(this);
	}
	collision({x, y}, fromUpper) {
		const range   = 6;
		const imgData = Bunker.ctx.getImageData(x-range/2,y, range, 1);
		return imgData.data.filter(d=> d > 0).length >= range
			&& this.#destroy(Bunker.ctx, {x, y}, fromUpper);
	}
	#cache({ctx,x,y,Width:w,Height:h}) {
		const hw = w/2;
		ctx.save();
		ctx.translate(x,y);
		ctx.beginPath();
			ctx.moveTo(hw/4, 0);
			ctx.lineTo(w-(hw/4), 0);
			ctx.lineTo(w, hw/4);
			ctx.lineTo(w, h);
			ctx.lineTo(w-(w/5), h);
			ctx.lineTo(w-(w/5)-10, h-15);
			ctx.lineTo((w/5)+10, h-15);
			ctx.lineTo((w/5), h);
			ctx.lineTo(0, h);
			ctx.lineTo(0, hw/4);
		ctx.closePath();
		ctx.fillStyle = '#CC9';
		ctx.fill();
		ctx.restore();
	}
	#destroy(ctx, {x, y}, fromUpper) {
		const dy1 = fromUpper ? -4 :  15;
		const dy2 = fromUpper ? 25 : -10;
		const by1 = fromUpper ? -4 : -20;
		const by2 = fromUpper ? 30 :   0;
		ctx.save();
		ctx.translate(x, y);
		ctx.beginPath();
			ctx.moveTo(0, dy1);
			ctx.lineTo(0, dy2);
			ctx.lineWidth = 12;
		ctx.stroke();
		for (let i=0; i<250; i++) {
			const s  = 2.5;
			const ox = randInt(-8,+8);
			const oy = randInt(by1, by2);
			const cx = cos(randInt(0,PI*2)) * 4 + ox;
			const cy = sin(randInt(0,PI*2)) * 4 + oy;
			ctx.fillRect(cx-(s/2), cy-(s/2), s,s);
		}
		ctx.restore();
		return true;
	}
} freeze(Bunker);
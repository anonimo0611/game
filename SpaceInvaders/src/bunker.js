import {Rect}  from '../lib/rect.js';
import {Scene} from './scene.js';
import {cvs,ctx,cvsForBunker} from './_canvas.js';

const Width   = cvs.width / 8;
const Height  = ceil(Width / 1.5);
const Bunkers = Array(4).fill();

export class Bunker extends Rect {
	static cvs    = cvsForBunker;
	static ctx    = this.cvs.getContext('2d', {willReadFrequently:true});
	static Top    = cvs.height * 3/4;
	static Bottom = this.Top + Height;
	static collision(obj, fromAbove) {
		return Bunkers.some(b=>
			b.collisionRect(obj) && b.collisionPixel(obj.tipPos, fromAbove));
	}
	static contains(pos) {
		return Bunkers.some(b=> b.contains(pos));
	}
	static init() {
		Bunker.ctx.clearRect(0,0, cvs.width,cvs.height);
		Bunker.ctx.globalCompositeOperation = 'source-over';
		for (let i of Bunkers.keys()) {Bunkers[i] = new Bunker(i)}
		Bunker.ctx.globalCompositeOperation = 'destination-out';
	}
	static draw() {
		ctx.drawImage(Bunker.cvs, 0,0);
	}
	constructor(i) {
		const x = (Width*3/4) + (i*Width) + ((i*Width)*3/4);
		super(vec2(x, Bunker.Top), Width, Height);
		this.ctx = Bunker.ctx;
		this.#cache(this);
	}
	collisionPixel({x, y}, fromAbove) {
		const range   = 6;
		const imgData = Bunker.ctx.getImageData(x - range/2, y, range, 1);
		return imgData.data.filter(d=> d > 0).length >= range
			&& this.#destroy(Bunker.ctx, {x, y}, fromAbove);
	}
	#cache({ctx,x,y,Width:w,Height:h}) {
		const hw = w/2;
		ctx.save();
		ctx.translate(x, y);
		ctx.beginPath();
			ctx.moveTo(hw/4, 0);
			ctx.lineTo(w-(hw/4), 0);
			ctx.lineTo(w, hw/4);
			ctx.lineTo(w, h);
			ctx.lineTo(w-(w/5), h);
			ctx.lineTo(w-(w/5)-hw/4, h-h/3.5);
			ctx.lineTo((w/5)+hw/4, h-h/3.5);
			ctx.lineTo((w/5), h);
			ctx.lineTo(0, h);
			ctx.lineTo(0, hw/4);
		ctx.fillStyle = '#CC9';
		ctx.fill();
		ctx.restore();
	}
	#destroy(ctx, {x, y}, fromAbove) {
		ctx.save();
		ctx.translate(x, y);
		this.#laserDig(ctx, Height, fromAbove);
		this.#particle(ctx, Height, fromAbove);
		ctx.restore();
		return true;
	}
	#laserDig(ctx, h, fromAbove) {
		ctx.beginPath();
			ctx.lineCap   = 'round';
			ctx.lineWidth = round(Width/6.6);
			ctx.moveTo(0, (fromAbove? -h/13.5 : +h/3.5)|0);
			ctx.lineTo(0, (fromAbove? +h/ 2.0 : -h/5.4)|0);
		ctx.stroke();
	}
	#particle(ctx, h, fromAbove) {
		const size = 2.3;
		const xMin = ctx.lineWidth/3.0;
		const xMax = ctx.lineWidth/1.2;
		const yMin = (fromAbove? -h/13.5 : -h/2.7)|0;
		const yMax = (fromAbove? +h/ 1.5 : +h/1.0)|0;
		for (let y=yMin; y<yMax; y++) {
			const x  = [randFloat(-xMin, -xMax), randFloat(xMin, xMax)][y % 2];
			const cx = cos(randFloat(0, PI*2)) + x;
			const cy = sin(randFloat(0, PI*2)) + y;
			ctx.fillRect(cx-(size/2), cy-(size/2), size,size);
		}
	}
} freeze(Bunker);
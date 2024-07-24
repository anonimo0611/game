import {Vec2}    from '../lib/vec2.js';
import {Rect}    from '../lib/rect.js';
import {Scene}   from './scene.js';
import {cvs,ctx} from './_canvas.js';

const Width   = cvs.width / 8;
const Height  = ceil(Width / 1.5);
const Bunkers = Array(4).fill();

export class Bunker extends Rect {
	static {
		const attrs = {willReadFrequently:true};
		[this.cvs,this.ctx]= canvas2D(null, cvs.width, cvs.height, attrs).vals;
	}
	static Top    = cvs.height * 3/4;
	static Bottom = this.Top + Height;
	static collision(obj, fromAbove) {
		return Bunkers.some(b=>
			b.collisionRect(obj) && b.collisionPixel(obj, fromAbove));
	}
	static contains(pos) {
		return Bunkers.some(b=> b.contains(pos));
	}
	static init() {
		this.ctx.clear();
		this.ctx.globalCompositeOperation = 'source-over';
		for (let i of Bunkers.keys()) {Bunkers[i] = new Bunker(i)}
		this.ctx.globalCompositeOperation = 'destination-out';
	}
	static draw() {
		if (Scene.isTitle || Scene.isIntro) {return}
		ctx.drawImage(this.cvs, 0,0);
	}
	constructor(i) {
		const x = (Width*3/4) + (i*Width) + ((i*Width)*3/4);
		super(Vec2(x, Bunker.Top), Width, Height);
		this.ctx = Bunker.ctx;
		this.#cache(this);
	}
	collisionPixel({tipPos}, fromAbove) {
		const {x, y}  = tipPos, w = int(cvs.width / 80);
		const imgData = Bunker.ctx.getImageData(x - w/2, y, w, 1);
		return imgData.data.filter(d=> d > 0).length >= w
			&& this.#destroy(Bunker.ctx, {x,y,Width:w}, fromAbove);
	}
	#cache({ctx,x,y,Width:w,Height:h}) {
		ctx.save();
		ctx.translate(x, y);
		ctx.beginPath();
			ctx.fillStyle = '#CC9';
			ctx.moveTo(w/8, 0);
			ctx.lineTo(w-(w/8), 0);
			ctx.lineTo(w, w/8);
			ctx.lineTo(w, h);
			ctx.lineTo(w-(w/5), h);
			ctx.lineTo(w-(w/5)-w/8, h-h/3.5);
			ctx.lineTo((w/5)+w/8, h-h/3.5);
			ctx.lineTo((w/5), h);
			ctx.lineTo(0, h);
			ctx.lineTo(0, w/8);
		ctx.fill();
		ctx.restore();
	}
	#destroy(ctx, {x,y,Width}, fromAbove) {
		ctx.save();
		ctx.translate(x, y);
		this.#laserDig(ctx, Width, Height, fromAbove);
		this.#particle(ctx, Width, Height, fromAbove);
		ctx.restore();
		return true;
	}
	#laserDig(ctx, w, h, fromAbove) {
		ctx.beginPath();
			ctx.lineCap   = 'round';
			ctx.lineWidth = w * 1.5;
			ctx.moveTo(0, (fromAbove? -h/13.5 : +h/3.5)|0);
			ctx.lineTo(0, (fromAbove? +h/ 2.0 : -h/5.4)|0);
		ctx.stroke();
	}
	#particle(ctx, w, h, fromAbove) {
		const size = w * 0.2875;
		const xMin = ctx.lineWidth/3.0;
		const xMax = ctx.lineWidth/1.2;
		const yMin = (fromAbove? -h/13.5 : -h/3)|0;
		const yMax = (fromAbove? +h/ 1.5 : +h/1)|0;
		for (let y=yMin; y<yMax; y++) {
			const x  = [randFloat(-xMin, -xMax), randFloat(xMin, xMax)][y & 1];
			const cx = cos(randFloat(0, PI*2)) + x;
			const cy = sin(randFloat(0, PI*2)) + y;
			ctx.fillStyle = 'red';
			ctx.fillRect(cx-(size/2), cy-(size/2), size,size);
		}
	}
} freeze(Bunker);
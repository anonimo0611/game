import {Ticker} from '../lib/timer.js';
import {ctx}    from './_canvas.js';

const Explosion1Set = new Set();
const Explosion2Set = new Set();

export class Explosion1 {
	static draw()   {Explosion1Set.forEach(e=> e.draw())}
	static update() {Explosion1Set.forEach(e=> e.update())}
	static get exisits() {return Explosion1Set.size > 0}
	#counter = 0;
	LineSet  = new Set();
	constructor({Pos,Width,Height,Color}) {
		Pos.add(Width/2, Height/2);
		for (let i=0; i<=360; i+=20) {
			const cx = cos(i*PI/180) * Width /12;
			const cy = sin(i*PI/180) * Height/12;
			const cv = vec2(cx/2, cy/2);
			this.LineSet.add({Pos:Pos.clone,cv});
		}
		this.color = Color;
		Explosion1Set.add(freeze(this));
	}
	update() {
		if (this.#counter++ >= 10) {
			Explosion1Set.delete(this);
		}
	}
	draw() {
		for (const {Pos,cv} of this.LineSet) {
			Pos.add(cv);
			ctx.save();
			ctx.translate(...Pos.vals);
			ctx.beginPath();
				ctx.lineWidth = 4;
				ctx.strokeStyle = this.color;
				ctx.moveTo(0,0);
				ctx.lineTo(...vec2(cv).mul(6).vals);
			ctx.stroke();
			ctx.restore();
		}
	}
}
export class Explosion2 {
	static draw()   {Explosion2Set.forEach(p=> p.draw())}
	static update() {Explosion2Set.forEach(p=> p.update())}
	#alpha   = 1;
	#counter = 0;
	ParticleSet = new Set();
	constructor({Pos,Width,Height,Color}, {duration=1000}={}) {
		this.Pos      = vec2(Pos).add(Width/2, Height/2);
		this.color    = Color;
		this.Width    = Width;
		this.Height   = Height;
		this.duration = duration / Ticker.Interval;
		this.#setParticles();
		Explosion2Set.add(freeze(this));
	}
	#setParticles() {
		this.ParticleSet.clear();
		for (let i=0; i<=360; i+=5) {
			const cx = cos(i*PI/180)*randInt(2,this.Width *3/5);
			const cy = sin(i*PI/180)*randInt(2,this.Height*3/5);
			const cv = vec2(cx, cy);
			this.ParticleSet.add(cv)
		}
	}
	update() {
		//this.#alpha = max(this.#alpha-= 1/this.duration,0);
		if (this.#counter++ >= this.duration) {
			return void Explosion2Set.clear();
		}
		if (Ticker.count % 4 == 0) {
			this.#setParticles();
		}
	}
	draw() {
		for (const cv of this.ParticleSet) {
			ctx.save();
			ctx.globalAlpha = this.#alpha;
			ctx.translate(...this.Pos.vals);
			ctx.beginPath();
				ctx.fillStyle = this.color;
				ctx.arc(...cv.mul(1.1).vals, randInt(1,2), 0, PI*2);
			ctx.fill();
			ctx.restore();
		}
	}
}
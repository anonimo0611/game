import {ItemType}   from './item.js';
import {hsl,rgba}   from '../lib/color.js';
import {Paddle}   from './paddle.js';
export class PaddleGrad {
	constructor(ctx) {
		this.ctx    = ctx;
		this.Body   = this.#lineHSL(0, 0, 46);
		this.Line   = new Map()
			.set(undefined,      this.#lineHSL( 15, 100, 40))
			.set(ItemType.Catch, this.#lineHSL( 33, 240, 29))
			.set(ItemType.Laser, this.#lineHSL(240,  33, 29))
		;
		this.Sphere = new Map()
			.set(undefined,      ()=> this.#sphereHSL(210, 100, 38))
			.set(ItemType.Catch, ()=> this.#sphereHSL(120, 100, 29))
			.set(ItemType.Laser, ()=> this.#sphereHSL(  0, 100, 29))
		;
		freeze(this);
	}
	#lineHSL(h=0,s=0,l=100) {
		const {Width,Height}= Paddle;
		const
		gr = this.ctx.createLinearGradient(Width,0,Width,Height);
		gr.addColorStop(0.0, hsl(h,s,l));
		gr.addColorStop(0.3, hsl(h,s,90));
		gr.addColorStop(0.4, hsl(h,s,l));
		gr.addColorStop(1.0, hsl(h,s,l*1.1));
		return gr;
	}
	#sphereHSL(h=0,s=0,l=100) {
		const radius = Paddle.Height/2;
		const lightness = max(abs(sin(Paddle.blink))*(l*1.4), l);
		return [0,1].map((_,i)=> { // Both sides
			const sx = (!i ? radius : -radius) / 4;
			const
			gr = this.ctx.createRadialGradient(sx,-radius/2,0, 0,0,radius);
			gr.addColorStop(0.0, hsl(h,s,90));
			gr.addColorStop(0.5, hsl(h,s,lightness));
			gr.addColorStop(1.0, hsl(h,s,lightness));
			return gr;
		});
	}
}
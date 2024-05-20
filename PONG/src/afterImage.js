import {rgba} from '../lib/color.js';
import {cvs,ctx,DefaultRGBA} from './_canvas.js';

export class AfterImage {
	Positions = Array(this.PosMax);
	constructor({PosMax=1, gAlpha=1, LineWidth=1, LineTaper=LineWidth}) {
		this.gAlpha    = gAlpha;
		this.PosMax    = int(PosMax);
		this.lineWidth = LineWidth;
		this.LineTaper = LineTaper;
	}
	get Pos() {
		return this.Positions[0]
	}
	reset () {
		this.Positions.splice(0);
	}
	update() {
		for (let i=this.PosMax-1; i>0; i--)
			this.Positions[i] = vec2(this.Positions[i-1]);
	}
	#drawAfterImage() {
	 	const {Type,lineWidth:lw,PosMax,Positions,Radius=0,gAlpha}= this;
	 	ctx.save();
		for (let i=1; i<PosMax; i++) {
	 		if (vec2(Positions[i]).isEqual(0, 0)
		 		|| Positions[i].x < -Radius
		 		|| Positions[i].x > cvs.width+Radius
	 		) continue;
	 		const {r,g,b}= DefaultRGBA;
			ctx.strokeStyle = rgba(r,g,b,((PosMax-i)/PosMax) * gAlpha);
			ctx.lineWidth = max(((PosMax-i)/PosMax) * lw, this.LineTaper);
			ctx.beginPath();
			ctx.moveTo(...Positions[i].vals);
			ctx.lineTo(...Positions[i-1].vals);
			ctx.stroke();
		}
		ctx.restore();
	}
	draw() {
		this.#drawAfterImage();
	}
}
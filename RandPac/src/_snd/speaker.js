const {cvs,ctx}= canvas2D('speakerCvs');
export const Speaker = new class {
	draw(vol) {
		const {width,height}= cvs;
		const step = this.#step(vol);
		ctx.clear();
		ctx.save();
		ctx.fillStyle = ctx.strokeStyle = '#FFF';
		ctx.translate(height/2, height/2);
		ctx.scale(height/100, height/100);
		this.#drawBody();
		(step <= 0)
			? this.#drawMute()
			: this.#drawWaves(vol, step);
		ctx.restore();
	}
	#step(v) {
		if (v == 0) return 0;
		if (between(v, 8, 10)) return 3;
		if (between(v, 3,  7)) return 2;
		if (between(v, 1,  2)) return 1;
	}
	#drawBody() {
		ctx.beginPath();
		ctx.moveTo( -7, -35);
		ctx.lineTo(-31, -12);
		ctx.lineTo(-45, -12);
		ctx.lineTo(-45, +12);
		ctx.lineTo(-31, +12);
		ctx.lineTo( -7, +35);
		ctx.fill();
	}
	#drawMute() {
		ctx.save();
		ctx.translate(20, 0);
		ctx.beginPath();
		ctx.lineWidth = 9;
		ctx.moveTo(-15, -15);
		ctx.lineTo(+15, +15);
		ctx.moveTo(+15, -15);
		ctx.lineTo(-15, +15);
		ctx.stroke();
		ctx.restore();
	}
	#drawWaves(vol, step) {
		ctx.save();
		ctx.lineCap = 'round';
		ctx.lineWidth = 8;
		[[0.0, 0, 12, 17, 0, -PI/2.6, PI/2.6],
		 [4.5, 0, 23, 32, 0, -PI/2.9, PI/2.9],
		 [6.0, 0, 37, 50, 0, -PI/3.3, PI/3.3],
		].forEach((v,s)=> {
			ctx.save();
			step <= s && (ctx.globalAlpha = vol/10+.3);
			ctx.beginPath();
			ctx.ellipse(...v);
			ctx.stroke();
			ctx.restore();
		});
		ctx.restore();
	}
};
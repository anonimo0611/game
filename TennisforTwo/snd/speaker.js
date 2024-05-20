const {cvs,ctx}= canvas2D('canvas');
export const Speaker = new class {
	draw(vol, size, {lineWidth,color,padding}) {
		const step = this.#step(vol);
		ctx.clear();
		ctx.save();
		ctx.fillStyle = ctx.strokeStyle = color;
		ctx.translate(size/2+padding/4, size/2+padding/4);
		ctx.scale(size/88, size/88);
		this.#drawBody();
		(step <= 0)
			? this.#drawMute(lineWidth)
			: this.#drawWaves({vol,step,lineWidth});
		ctx.restore();
	}
	#step(v) {
		if (v == 0) return 0;
		if (between(v, 9, 10)) return 3;
		if (between(v, 4,  8)) return 2;
		if (between(v, 2,  3)) return 1;
	}
	#drawBody() {
		ctx.beginPath();
		ctx.moveTo(-12, -35);
		ctx.lineTo(-36, -12);
		ctx.lineTo(-50, -12);
		ctx.lineTo(-50, +12);
		ctx.lineTo(-36, +12);
		ctx.lineTo(-12, +35);
		ctx.fill();
	}
	#drawMute(lineWidth) {
		ctx.save();
		ctx.translate(18, 0);
		ctx.beginPath();
		ctx.moveTo(-16, -16);
		ctx.lineTo(+16, +16);
		ctx.moveTo(+16, -16);
		ctx.lineTo(-16, +16);
		ctx.lineWidth = lineWidth * 1.2;
		ctx.stroke();
		ctx.restore();
	}
	#drawWaves({vol,step,lineWidth}) {
		ctx.save();
		ctx.lineWidth = lineWidth;
		for (let i=0; i<3; i++) {
			const [ofstX,ofstY]= [i*14,i*8];
			ctx.save();
			step <= i && (ctx.globalAlpha = vol/10);
			ctx.beginPath();
			ctx.moveTo(-5+ofstX,-20-ofstY);
			ctx.lineTo(+7+ofstX, -8-ofstY);
			ctx.lineTo(+7+ofstX, +8+ofstY);
			ctx.lineTo(-5+ofstX,+20+ofstY);
			ctx.stroke();
			ctx.restore();
		}
		ctx.restore();
	}
};
export const Glow = new class Cls {
	static cvs;
	static {$on('Title', Cls.#reset)}
	static #reset() {
		const {cvs,ctx,width,height}=
			canvas2D(null, A*2.28, A*2.28);
		Cls.cvs = cvs;
		ctx.filter = `blur(${A/3}px)`;
		fillCircle(ctx)(width/2, height/2, A/2, 'red');
	}
	get cvs() {return Cls.cvs}
};
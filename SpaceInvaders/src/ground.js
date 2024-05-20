import {Player} from './player.js';
import {Scene}  from './scene.js';
import {cvs,ctx,cvsForGround} from './_canvas.js';
export const Ground = freeze(new class {
	static {$on('load Title NewRound', _=> Ground.#cache(Ground.ctx))}
	cvs    = cvsForGround;
	ctx    = this.cvs.getContext('2d');
	Width  = this.cvs.width;
	Height = this.cvs.height;
	Top    = cvs.height - Player.Height * 1.4;
	Bottom = this.Top + this.Height;
	draw() {
		ctx.save();
		ctx.translate(0, this.Top);
		ctx.drawImage(Ground.cvs, 0,0);
		ctx.restore();
	}
	crack({x}) {
		const [w, h]= [4, this.Height];
		for (let i=-1; i<=1; i++)
			this.ctx.clearRect(x-w*(i*w/2), 0, w, h);
	}
	#cache(ctx) {
		ctx.fillStyle = '#66FF66';
		ctx.fillRect(0,0, this.Width, this.Height);
	}
});
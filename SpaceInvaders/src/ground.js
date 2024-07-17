import {Player}  from './player.js';
import {Scene}   from './scene.js';
import {cvs,ctx} from './_canvas.js';

const [$cvs,$ctx]= canvas2D(null, cvs.width, 3).vals;

export const Ground = freeze(new class {
	static {$on('load Title NewRound', ()=> Ground.#cache())}
	Width  = $cvs.width;
	Height = $cvs.height;
	Top    = cvs.height - (Player.Height*1.4);
	Bottom = this.Top + this.Height;
	draw() {
		if (Scene.isTitle || Scene.isIntro) {return}
		ctx.save();
		ctx.translate(0, this.Top);
		ctx.drawImage($cvs, 0,0);
		ctx.restore();
	}
	crack({x}) {
		const [w, h] = [2, this.Height];
		for (let i=-1; i<=1; i++) {
			$ctx.clearRect(x+i*(w*2)-w/2, 0, w, h);
		}
	}
	#cache() {
		$ctx.fillStyle = '#6F6';
		$ctx.fillRect(0,0, this.Width, this.Height);
	}
});
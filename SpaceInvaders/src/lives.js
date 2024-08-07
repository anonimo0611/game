import {cvs,ctx} from './_canvas.js';
import {Window}  from './_window.js';
import {Game}    from './_main.js';
import {Scene}   from './scene.js';
import {Player}  from './player.js';
import {Ground}  from './ground.js';

export const Lives = freeze(new class {
	static {$load(this.#setup)}
	static #setup() {
		$on('Start',    Lives.#onStart);
		$on('Extend',   Lives.#onExtend);
		$on('Respawn',  Lives.#onCrash);
		$on('GameOver', Lives.#onCrash);
	}
	Max   = 3;
	#left = this.Max;
	get left()  {return Lives.#left}
	#onStart()  {Lives.#left = Lives.Max}
	#onExtend() {Lives.#left++}
	#onCrash()  {Lives.#left--}

	draw() {
		if (Scene.isTitle) {return}

		const marginL  = 6;
		const fontSize = Window.FontSize;
		ctx.save();
		ctx.fillStyle = '#FFF';
		ctx.fillText(Lives.left, fontSize, Ground.Bottom+fontSize);
		ctx.translate(fontSize*2.5, Ground.Bottom);
		for (let i=0; i<Lives.left-1; i++) {
			ctx.save();
			ctx.translate((Player.Width*i)+(marginL*i), 0);
			ctx.drawImage(Player.cvs, 0,0);
			ctx.restore();
		}
		ctx.restore();
	}
});
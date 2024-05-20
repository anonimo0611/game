import {cvs,ctx} from './_canvas.js';
import {Window}  from './_window.js';
import {Game}    from './_main.js';
import {Scene}   from './scene.js';
import {Player}  from './player.js';
import {Ground}  from './ground.js';

export const Lives = freeze(new class {
	static {$on('load',_=> Lives.#setup())}
	#setup() {
		$on('Start',    Lives.#onStart);
		$on('Extend',   Lives.#onExtend);
		$on('Respawn',  Lives.#onRemove);
		$on('GameOver', Lives.#onRemove);
	}
	Max   = 3;
	#left = this.Max;
	get left()  {return Lives.#left}
	#onStart()  {Lives.#left = Lives.Max}
	#onExtend() {Lives.#left++}
	#onRemove() {Lives.#left--}

	draw() {
		const mL = 6;
		const fs = Window.FontSize;
		const w  = Player.Width;
		const h  = Player.Height;

		ctx.save();
		ctx.fillStyle = 'white';
		ctx.fillText(Lives.left, fs, Ground.Bottom + fs);
		ctx.restore();

		ctx.save();
		ctx.translate(fs*2.5, Ground.Bottom);
		for (let i=0; i<Lives.left-1; i++) {
			ctx.save();
				ctx.translate((w*i)+(mL*i), 0);
				ctx.drawImage(Player.cvs, 0,0);
			ctx.restore();
		}
		ctx.restore();
	}
});
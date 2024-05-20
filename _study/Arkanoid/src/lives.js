import {cvs,ctx} from './_canvas.js';
import {Game}    from './_main.js';
import {Field}   from './field.js';
import {Paddle}  from './paddle.js';
import {Menu}    from './menu.js';

const cvsForLife = document.createElement('canvas');
const ScaleX = .45;
const ScaleY = .50;

export const Lives = freeze(new class {
	static {
		$on('load',_=> Lives.#setup());
	}
	#setup() {
		$on('SelLives',Lives.#set);
		$on('Start',   Lives.#onStart);
		$on('Extend',  Lives.#onExtend)
		$on('Respawn', Lives.#onRespawn);
	}
	context = cvsForLife.getContext('2d');

	#left = 0;
	get left()   {return Lives.#left}
	#set(_, n)   {Lives.#left = n}
	#onStart()   {Lives.#left = Menu.Lives.value}
	#onExtend()  {Lives.#left++}
	#onRespawn() {Lives.#left--}

	draw() {
		if (Game.isDemoScene)
			return;

		const w = ScaleX * Paddle.DefaultW;
		const h = ScaleY * Paddle.Height;
		const marginLeft = 4;
		const offsetLeft = Field.Left + marginLeft;
		ctx.save();
		ctx.translate(offsetLeft, cvs.height - h*1.8);
		for (let i=0; i<Lives.left; i++) {
			ctx.save();
				ctx.translate((w*i)+(marginLeft*i), 0);
				ctx.scale(ScaleX, ScaleY);
				ctx.drawImage(cvsForLife, 0,0);
			ctx.restore();
		}
		ctx.restore();
	}
});
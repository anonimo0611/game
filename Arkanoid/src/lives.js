import {cvs,ctx} from './_canvas.js';
import {Game}    from './_main.js';
import {Field}   from './field.js';
import {Paddle}  from './paddle.js';
import {Menu}    from './menu.js';

const [$cvs] = canvas2D(null).vals;
const ScaleX = .45;
const ScaleY = .50;

export const Lives = freeze(new class {
	static {$ready(this.#setup)}
	static #setup() {
		$on({
			SelLives: Lives.#set,
			Start:    Lives.#onStart,
			Extend:   Lives.#onExtend,
			Respawn:  Lives.#onRespawn,
		});
	}
	context = $cvs.getContext('2d');

	#left = Menu.Lives.value;
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
			ctx.drawImage($cvs, 0,0);
			ctx.restore();
		}
		ctx.restore();
	}
});
import {cvs,ctx} from './_canvas.js';
import {Game}    from './_main.js';
import {Field}   from './field.js';
import {Paddle}  from './paddle.js';
import {Menu}    from './menu.js';

const [$cvs] = canvas2D(null).vals;
const ScaleX = 0.45;
const ScaleY = 0.50;

export const Lives = freeze(new class {
	static {$ready(this.#setup)}
	static #setup() {
		$on({
			Start:   Lives.#onStart,
			Respawn: Lives.#onRespawn,
		});
		$(Menu.LivesMenu).on({Select:Lives.#set});
	}
	context = $cvs.getContext('2d');

	#left = Menu.LivesMenu.value;
	get left()   {return Lives.#left}
	#set(_, n)   {Lives.#left = n}
	#onStart()   {Lives.#left = Menu.LivesMenu.value}
	#onRespawn() {Lives.#left--}

	extend() {
		!Game.isDemoScene && Lives.#left++
	}
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
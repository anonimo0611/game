import {cvs,ctx} from './_canvas.js';
import {Game}    from './_main.js';
import {Field}   from './field.js';
import {Paddle}  from './paddle.js';
import {ItemMgr} from './item.js';
import * as Menu from './menu.js';

const [$cvs] = canvas2D(null).vals;
const ScaleX = 0.40;
const ScaleY = 0.50;

export const Lives = freeze(new class {
	static {$load(this.#setup)}
	static #setup() {
		$on({
			Start:   Lives.#onStart,
			Respawn: Lives.#onRespawn,
		});
		$(ItemMgr).on({Obtained: Lives.#onExtend});
		$(Menu.LivesMenu).on({change: Lives.#set});
	}
	context = $cvs.getContext('2d');

	#left = Menu.LivesMenu.value;
	get left()   {return Lives.#left}
	#set(_, n)   {Lives.#left = n}
	#onStart()   {Lives.#left = Menu.LivesMenu.value}
	#onRespawn() {Lives.#left--}

	#onExtend(_, type) {
		if (Game.isDemoScene) return;
		type == ItemMgr.Type.PlayerExtend && Lives.#left++
	}
	draw() {
		if (Game.isDemoScene)
			return;

		const w = ScaleX * Paddle.InitWidth;
		const h = ScaleY * Paddle.Height;
		const marginLeft = w * 0.15;
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
import {Vec2}   from './_lib/vec2.js';
import {BgCtx}  from './_main.js';
import {Scene}  from './scene.js';
import {Sprite} from './pacman/pac_sprite.js';
export const Lives = new class Cls {
	static left = 0;
	static {$on('Title Respawn', this.#reset)}
	static #reset() {
		const Size   = FOOTER_H * 0.85;
		const Radius = Size / 2.00;
		const Width  = Size * 1.15;
		const sprite = new Sprite({Radius}, {closed:false});

		Scene.isRespawn? Cls.left-- : (Cls.left=Lives.Max);
		BgCtx.save();
		BgCtx.translate(T+Radius/2, (CVS_SIZE-FOOTER_H)+(FOOTER_H-Size)/4);
		BgCtx.clear(0,0, Width*Lives.Max, FOOTER_H);

		for (let i=0; i<Cls.left; i++)
			sprite.draw(BgCtx, Vec2(Width*i, 1).add(Radius), {Radius});

		BgCtx.restore();
	}
	get Max()  {return [2,3,3][MAZE_IDX]}
	get left() {return Cls.left}
};
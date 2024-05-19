import {Ticker}   from '../lib/timer.js';
import {cvs,ctx}  from './_canvas.js';
import {Img}      from './_images.js';
import {FontSize} from './_canvas.js';
import {Actor}    from './actor.js';

class Enemy extends Actor {
	#alpha   = 0;
	#invert  = 0;
	#damage  = 0;
	appeared = false;
	killed   = false;
	get damaging() {
		return this.#damage > 0;
	}
	constructor() {
		super();
		this.attack  = 140;
		this.defence = 200;
		this.hp = 130;
		$on('EnemyDamage', _=> this.#damage = 45);
	}
	update() {
		if (enemy.appeared && !enemy.killed)
			this.#alpha = min(this.#alpha + 1/45, 1);
		if (enemy.killed)
			this.#alpha = max(this.#alpha - 1/30, 0);
		if (this.#damage > 0) {
			this.#damage--;
			if (Ticker.count %  5 == 0) this.#invert = 100;
			if (Ticker.count % 10 == 0) this.#invert = 0;
		}
	}
	draw() {
		const w = 354;
		const h = 430;
		const x = (cvs.width - w*1.2);
		ctx.save();
		ctx.globalAlpha = this.#alpha;
		if (this.#damage > 0)
			ctx.filter = `invert(${this.#invert}%)`;
		ctx.drawImage(Img.Dragon, 0,0, w,h, x,FontSize/2, w,h);
		ctx.restore();
	}
}
export let enemy = new Enemy;
$on('Start', _=> enemy = new Enemy);
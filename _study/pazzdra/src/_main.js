import {Ticker}  from '../lib/timer.js';
import {Grid}    from './_grid.js';
import {cvs,ctx} from './_canvas.js';
import {bgImg}   from './_background.js';
import {Phase}   from './phase.js';
import {Orb}     from './orb.js';

export const Game = new class {
	static {$ready(this.#init)}
	static #init() {Ticker.set(Game.#mainLoop)}
	#comboCount = 0;
	get comboCount() {
		return Game.#comboCount;
	}
	resetComboCount() {
		Game.#comboCount = 0;
	}
	addComboCount() {
		Game.#comboCount++;
	}
	#background() {
		ctx.save();
		ctx.restore();
	}
	#update() {
		Orb.update();
	}
	#draw() {
		ctx.drawImage(bgImg, 0,0);
		Orb.draw();
		//byId('phase').textContent = Phase.current;
	}
	#mainLoop() {
		Game.#update();
		Game.#draw();
	}
};
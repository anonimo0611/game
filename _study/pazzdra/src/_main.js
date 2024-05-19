import {Ticker}   from '../lib/timer.js';
import {Grid}     from './_grid.js';
import {cvs,ctx}  from './_canvas.js';
import {Phase}    from './phase.js';
import {Orb,Orbs} from './orb.js';

const BgColorList = ['#201008','#402010'];
export const Game = new class {
	static {
		$on('load', this.#init);
	}
	static #init() {
		Ticker.set(Game.#mainLoop);
	}

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
		Orbs.flat().forEach(({x, y})=> {
			const {Size:s}= Grid;
			ctx.fillStyle = BgColorList[(x+y) % 2];
			ctx.fillRect(x*s, y*s, s,s);
		});
		ctx.restore();
	}
	#update() {
		Phase.update();
		Orb.update();
	}
	#draw() {
		Game.#background();
		Orb.draw();
		//byId('phase').textContent = Phase.current;
	}
	#mainLoop() {
		Game.#update();
		Game.#draw();
	}
};
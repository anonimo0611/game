import {Ticker}     from '../lib/timer.js';
import {Img}        from './_images.js';
import {cvs,ctx}    from './_canvas.js';
import {sleep}      from './_util.js';
import {FontSize}   from './_canvas.js';
import {Phase}      from './phase.js';
import {GameWindow} from './windowSystem.js';
import {Message}    from './windowSystem.js';
import {player}     from './player.js';
import {enemy}      from './enemy.js';

export const Game = new class {
	static {$on('load', _=> Game.#setup())}
	async #setup() {
		$on('Start', Game.#reset);
		Ticker.set(Game.#mainLoop);
		Message.set();
	}
	#reset() {
		Ticker.set(Game.#mainLoop);
		Message.set();
	}
	#update() {
		player.update();
		enemy.update();
	}
	async draw() {
		ctx.save();
		ctx.fillStyle = 'black';
		ctx.fillRect(0,0, cvs.width, cvs.height);
		ctx.restore();
		if (Phase.isGameOver) {
			await sleep(1000);
			Phase.switchToStart();
			return;
		}
		if (Phase.isClear) {
			const w = 307;
			const h =  67;
			const x = (cvs.width-w) /2;
			const y = (cvs.height-h)/2;
			ctx.drawImage(Img.TheEnd, 0,0, w,h, x,y, w,h);
			return;
		}
		GameWindow.draw();
		Message.draw();
		enemy.draw();
	}
	#mainLoop() {
		Game.#update();
		Game.draw();
	}
}
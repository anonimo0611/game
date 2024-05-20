import '../lib/wheel.js';
import './ctrl.js';
import {Sound}   from '../snd/sound.js';
import {Ticker}  from '../lib/timer.js';
import {Window}  from './_window.js';
import {cvs,ctx} from './_canvas.js';
import {Scene}   from './scene.js';
import {Ball}    from './ball.js';
import {Player}  from './player.js';
import {Players} from './player.js';
import {Score}   from './score.js';
import {Message} from './message.js';

export const Game = new class {
	static {
		$ready(_=> Game.#setup());
	}
	#setup() {
		Game.#reset();
		dBody.dataset.loading = false;
		$on('blur', Game.#pause);
		$on('Demo InGame', Game.#reset);
	}
	#pause() {
		if (Scene.isDemo)
			return;
		Ticker.pause(true);
		Game.draw();
	}
	#reset() {
		Ball.reset();
		Player.reset();
		Ticker.set(Game.#mainLoop);
	}
	#update() {
		if (Window.resizing)
			return;
		Ball.update();
		if (!Scene.isDemo) {
			Players.forEach(p=> p.update());
			Score.update();
		}
	}
	#drawCenterLine() {
		const lineSeg = int(cvs.height / 60);
		ctx.save();
		ctx.beginPath();
		ctx.setLineDash([lineSeg*1.1, lineSeg]);
		ctx.moveTo(cvs.width/2, 0);
		ctx.lineTo(cvs.width/2, cvs.height);
		ctx.lineWidth = 5;
		ctx.stroke();
		ctx.restore();
	}
	draw() {
		ctx.clearRect(0,0, cvs.width,cvs.height);
		this.#drawCenterLine();
		Message.draw();
		if (!Scene.isDemo)
			Players.forEach(p=> p.draw());
		Score.draw();
		Ball.draw();
	}
	#mainLoop() {
		Game.#update();
		Game.draw();
	}
}
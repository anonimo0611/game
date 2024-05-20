import {Ticker}   from '../lib/timer.js';
import {Timer}    from '../lib/timer.js';
import {Sound}    from '../snd/sound.js';
import {ctx}      from './canvas.js';
import {debugLog} from './_log.js';
import {Scene}    from './scene.js';
import {Pointer}  from './pointer.js';
import {Pause}    from './pause.js';
import {Color}    from './colors.js';
import {Button}   from './buttons.js';
import {Title}    from './title.js';
import {Score}    from './score.js';
import {Court}    from './court.js';
import {Player}   from './player.js';
import {Com}      from './player.js';
import {Ball}     from './ball.js';

const Game = new class {
	static {$ready(this.#setup)}
	static #setup() {
		$on({
			Start:  Game.start,
			Reset:  Game.reset,
			Init:   Game.init,
			keydown:Game.onKeyDown,
		});
		Ticker.set(Game.mainLoop);
		Game.#setupContext();
		Game.init();
	}
	#setupContext() {
		ctx.globalCompositeOperation = 'screen';
		ctx.lineWidth   = Court.LineWidth;
		ctx.fillStyle   = Color.CyanRGBA;
		ctx.strokeStyle = Color.CyanRGBA;
	}
	onKeyDown(e) {
		if (e.originalEvent.repeat) return;
		/^R$/i.test(e.key) && $trigger('Reset');
	}
	reset() {
		Sound.stop().play('info');
		Game.init();
	}
	init() {
		Scene.switchToTitle();
		Timer.cancelAll();
		Player.setServe(Player.Side.One);
	}
	start() {
		Scene.switchToInGame();
		Player.setServe(Player.Side.One);
		Sound.play('start');
	}
	update() {
		if (Pause.paused) return;
		Ball.update();
		Com.Pointer.update();
		//debugLog();
	}
	draw() {
		ctx.clear();
		Court.draw();
		Title.draw();
		Score.draw();
		Pointer.draw();
		Com.Pointer.draw();
		Ball.draw();
		Button.draw();
		Player.draw();
		Pause.draw();
	}
	mainLoop() {
		Game.update();
		Game.draw();
	}
};
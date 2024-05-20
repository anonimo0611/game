import '../lib/wheel.js';
import {Sound}      from '../snd/sound.js';
import {Ticker}     from '../lib/timer.js';
import {Timer}      from '../lib/timer.js';
import {Window}     from './_window.js';
import {cvs,ctx}    from './_canvas.js';
import {Scene}      from './scene.js';
import {Message}    from './message.js';
import {Score}      from './score.js';
import {Ground}     from './ground.js';
import {Lives}      from './lives.js';
import {Player}     from './player.js';
import {InvaderMgr} from './invader.js';
import {Title}      from './title.js';
import {Burst}      from './laser.js';
import {Explosion1} from './explosion.js';
import {Explosion2} from './explosion.js';
import {Bunker}     from './bunker.js';

export const Game = new class {
	static {$on('load', _=> Game.#setup())}
	RoundMax  = 8;
	#roundIdx = 0;
	get roundIdx() {return this.#roundIdx}
	get roundNum() {return this.#roundIdx+1}

	#setup() {
		Game.reset();
		$on('Title',    Game.reset);
		$on('Respawn',  Game.#respawn);
		$on('Clear',    Game.#clear);
		$on('GameOver', Game.#gameOver);
		$on('keydown',  Game.#onKeyDown);
		$on('blur', _=> Game.#pause(true));
		$on('focus',_=> Game.#pause(false));
	}
	#onKeyDown(e) {
		switch (e.key) {
		case '\x20':   return Scene.isTitle && Game.#start();
		case 'Delete': return Scene.switch(Scene.enum.Title);
		case 'Escape': return Game.#pause();
		}
	}
	#pause(force) {
		if (!Scene.isInGame) return;
		Ticker.pause(force)
			? Sound.pause()
			: Sound.resume();
		Game.#draw();
	}
	reset() {
		Game.#roundIdx = 0;
		Sound.stop();
		Bunker.init();
		InvaderMgr.init();
		Player.init();
		Ticker.stop().set(Game.#mainLoop);
	}
	#start() {
		$trigger('Start');
		Scene.switch(Scene.enum.Intro);
		Scene.switch(Scene.enum.InGame, 1500);
	}
	#respawn() {
		Player.init();
		Scene.switch(Scene.enum.InGame);
	}
	#clear() {
		Timer.set(1500, Game.#setNewRound);
	}
	#gameOver() {
		Sound.stop('ufo_high');
		Scene.switch(Scene.enum.Title, 3000);
	}
	#setNewRound() {
		$trigger('NewRound');
		Game.#roundIdx = ++Game.#roundIdx % Game.RoundMax;
		Bunker.init();
		InvaderMgr.init();
		Player.init();
		Scene.switch(Scene.enum.InGame);
	}
	#update() {
		Message.update();
		InvaderMgr.update();
		Player.update();
		Burst.update();
		Explosion1.update();
		Explosion2.update();
	}
	#draw() {
		ctx.clearRect(0,0,cvs.width,cvs.height);
		Score.draw();
		if (Scene.isTitle) {
			Title.draw();
			Message.draw();
			return;
		}
		if (Scene.isIntro) {
			Message.draw();
			Lives.draw();
			return;
		}
		InvaderMgr.draw();
		Burst.draw();
		Player.draw();
		Explosion1.draw();
		Explosion2.draw();
		Bunker.draw();
		Message.draw();
		Ground.draw();
		Score.draw();
		Lives.draw();
	}
	#mainLoop() {
		Game.#update();
		Game.#draw();
	}
}
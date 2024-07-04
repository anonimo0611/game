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
	static {$load(()=> Game.#setup())}
	RoundMax  = 8;
	#roundIdx = 0;
	get roundIdx() {return this.#roundIdx}
	get roundNum() {return this.#roundIdx+1}

	#setup() {
		Game.#onTitle();
		$on('Title',    Game.#onTitle);
		$on('Start',    Game.#onStart);
		$on('Respawn',  Game.#onRespawn);
		$on('Clear',    Game.#onClear);
		$on('NewRound', Game.#onNewRound);
		$on('GameOver', Game.#onGameOver);
		$on('keydown',  Game.#onKeyDown);
	}
	#onKeyDown(e) {
		switch (e.key) {
		case '\x20':   return Scene.isTitle && Scene.switchToStart();
		case 'Delete': return Scene.switchToTitle();
		}
	}
	#onTitle() {
		Game.#roundIdx = 0;
		Sound.stop();
		Bunker.init();
		InvaderMgr.init();
		Player.init();
		Ticker.stop().set(Game.#mainLoop);
	}
	#onStart() {
		Scene.switchToIntro();
		Scene.switchToInGame(1500);
	}
	#onRespawn() {
		Player.init();
		Scene.switchToInGame();
	}
	#onClear() {
		Timer.set(1500, Scene.switchToNewRound);
	}
	#onGameOver() {
		Sound.stop('ufo_high');
		Scene.switchToTitle(3000);
	}
	#onNewRound() {
		Game.#roundIdx = ++Game.#roundIdx % Game.RoundMax;
		Bunker.init();
		InvaderMgr.init();
		Player.init();
		Scene.switchToInGame();
	}
	#update() {
		Message.update();
		InvaderMgr.update();
		Player.update();
		Burst.update();
		Explosion1.update();
		Explosion2.update();
	}
	draw() {
		ctx.clear();
		Score.draw();
		switch (Scene.current) {
		case Scene.Enum.Title:
			Title.draw();
			Message.draw();
			return;
		case Scene.Enum.Intro:
			Lives.draw();
			Message.draw();
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
		Game.draw();
	}
}
import './_lib/mouse.js';
import {InfoBox}   from './ui.js';
import {isLoading} from './ui.js';
import {Sound}     from './_snd/sound.js';
import {Vec2}      from './_lib/vec2.js';
import {Dir}       from './_lib/direction.js';
import {Ticker}    from './_lib/timer.js';
import {Timer}     from './_lib/timer.js';
import {Scene}     from './scene.js';
import {Lives}     from './lives.js';
import {Points}    from './points.js';
import {Maze}      from './maze.js';
import {Pacman}    from './pacman/pac.js';
import {Ghost}     from './ghosts/ghost.js';

export const Container = byId('container');
export const Ctx   = canvas2D('obCvs').ctx;
export const BgCtx = canvas2D('bgCvs').ctx;

const Game = new class {
	static {$ready(this.setup)}
	static setup(e) {
		$on({
			keydown: Game.onKeydown,
			Pause:   Game.draw,
			Resize:  Game.init,
			Start:   Game.startGame,
			Clear:   Game.playEnds,
			Losing:  Game.playEnds,
			blur:_=> Game.pause(true),
		});
		$('#seedInput').on({input:Game.enterSeed});
		Game.init(e, paramFromCurrentURL('seed'));
	}
 	enterSeed(e)  {
		this.value !== '' && Game.init(e, +this.value);
	}
	onKeydown(e) {
		if (isLoading
			|| !Sound.setupCompleted
			|| InfoBox.displayed
			|| isCombinationKey(e)
			|| e.originalEvent.repeat
		) return;
		switch ( e.key.toUpperCase() ) {
		case 'R':
			dBody.dataset.transition = Scene.isStart;
			Game.retry()
			break;
		case 'G':
			dBody.dataset.transition = Scene.isStart;
			Game.init(e);
			break;
		case 'TAB':
			Scene.isPlaying && e.preventDefault();
			break;
		case 'ESCAPE':
			Scene.isStart   && Game.retry();
			Scene.isPlaying && Game.pause();
			break;
		default:
			if (dqs('input:focus')) break;
			const v = Vec2[Dir.from(e, {awsd:true})];
			v && Scene.isTitle && Scene.switchToStart();
			v && Ticker.paused && Game.pause();
		}
	}
	pause(force) {
		if (!Scene.isPlaying) return;
		Ticker.pause(force) && $trigger('Pause');
		Sound.pauseAll(Ticker.paused);
		dBody.dataset.paused = Ticker.paused;
	}
	init(_, seed) {
		Game.reset(true, seed);
		Ticker.set(Game.mainLoop);
	}
	retry() {
		Game.reset();
		Ticker.set(Game.mainLoop);
	}
	reset(isInit=false, seed) {
		dBody.dataset.paused = false;
		Sound.stop();
		Ticker.stop();
		Ctx.clear();
		Scene.switchToReset({isInit,seed});
		Scene.switchToTitle();
	}
	startGame() {
		Container.focus();
		Sound.play('start');
		Timer.set(4300, Game.playBegins);
	}
	respawn() {
		Scene.switchToRespawn();
		Timer.set(2000, Game.playBegins);
	}
	playBegins() {
		dBody.dataset.transition = true;
		Scene.switchToPlaying();
	}
	playEnds() {
		if (Lives.left <= 0 || Scene.isClear) {
			!Scene.isClear && Scene.switchToGameOver();
			Timer.set(5000, Game.retry);
			return;
		}
		Timer.set(3000, Game.respawn);
	}
	update() {
		Maze.PowDot.update();
		Pacman.instance.update();
		Ghost.update();
	}
	draw() {
		Ctx.clear();
		Maze.PowDot.draw();
		Ghost.drawBehind();
		Pacman.instance.draw();
		Ghost.drawFront();
		Points.draw();
	}
	mainLoop() {
		Game.update();
		Game.draw();
	}
};
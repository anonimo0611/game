import '../lib/wheel.js';
import './background.js';
import {Ticker}  from '../lib/timer.js';
import {Confirm} from '../lib/confirm.js';
import {Sound}   from '../snd/sound.js';
import {Window}  from './_window.js';
import * as Cvs  from './_canvas.js';
import {Menu}    from './menu.js';
import {Scene}   from './scene.js';
import {Stages}  from './stage.js';
import {Demo}    from './demo.js';
import {Message} from './message.js';
import {Score}   from './score.js';
import {Lives}   from './lives.js';
import {Paddle}  from './paddle.js';
import {BallG}   from './ball.js';
import {BrickG}  from './brick.js';
import {Army}    from './army.js';
import {Item}    from './item.js';
import {Laser}   from './laser.js';

const {cvs,ctx,cvsBrick,cvsShadow}= Cvs;

export const Game = freeze(new class {
	static {$load(this.#setup)}
	static #setup() {
		$on({
			Reset:    Game.#reset,
			Clear:    Game.#clear,
			Respawn:  Game.#respawn,
			SelStage: Game.#selectStage,
			focus:    Game.#confirm,
			blur:     Game.#confirm,
			keydown:  Game.#confirm,
		});
		$(cvs).on({
			mousedown:   Game.#start,
			contextmenu: Game.#confirm,
		});
		document.body.addClass('loaded');
		Game.#reset();
	}
	ReadyTime  = 2200; // ms
	#stageIdx  = Menu.StageMenu.index;
	#respawned = false;
	get stageIdx()  {return this.#stageIdx}
	get stageNum()  {return this.#stageIdx+1}
	get respawned() {return this.#respawned}

	get isReadyScene() {return Scene.some('Reset|Ready')}
	get isDemoScene()  {return Scene.some('Reset|InDemo|EndDemo')}
	get isPlayScene()  {return Scene.some('InDemo|InGame')}

	acceptEventInGame(e) {
		if (!e || e.button > 0 || !e.target)
			return false;
		if (!Scene.isInGame)
			return false;
		return (
			   e.target == cvs
			|| e.target == document.body
			|| e.target == Window.Board);
	}
	#selectStage(_, stageIdx) {
		Game.#stageIdx = stageIdx;
		Scene.switchToReset();
	}
	#reset() {
		Game.#stageIdx  = Menu.StageMenu.index;
		Game.#respawned = false;
		Game.#init();
		Scene.switchToInDemo(Game.ReadyTime+500);
	}
	#init() {
		BallG.init();
		BrickG.init();
		Paddle.init();
		Ticker.set(Game.#mainLoop);
		$trigger('Init');
	}
	#resume() {
		Ticker.pause(false);
		Sound.resume();
		$trigger('Resume');
	}
	#restart() {
		Scene.switchToReset();
		Game.#start();
	}
	#start(e) {
		if (e?.button > 0 || !Game.isDemoScene)
			return;
		$trigger('Start');
		Scene.switchToReady();
		Game.#init();
		Game.#ready();
	}
	#ready() {
		Sound.stop().play('start');
		Scene.switchToInGame(Game.ReadyTime);
	}
	#respawn() {
		Game.#respawned = true;
		Scene.switchToReady();
		Scene.switchToInGame(Game.ReadyTime);
		BallG.init();
		Paddle.init();
	}
	#clear() {
		(Game.stageNum == Stages.length)
			? Ticker.Timer.sequence(
				[1500, Scene.switchToGameOver],
				[1500, Scene.switchToReset])
			: Ticker.Timer.set(2000, Game.#setNewStage);
	}
	#setNewStage() {
		Game.#stageIdx++;
		Game.#respawned = false;
		Scene.switchToReady();
		Game.#init();
		Game.#ready();
	}
	#confirm(e) {
		if (Game.isDemoScene) {
			Ticker.pause(e.type == 'blur');
			return;
		}
		if (Confirm.opened)
			return;

		if (e.key  != 'Escape'
		 && e.type != 'blur'
		 && e.type != 'contextmenu'
		) return;

		const content = e.type == 'blur'
			? 'Browser window is\nnow inactive!'
			: 'You really want to\nquit the game?';

		e.preventDefault();
		Ticker.pause(true);
		Sound.pause();
		Confirm.open({
			content,
			cancelId:   'Resume',
			autoFocusId:'Resume',
			funcCfg: {
				Resume:  Game.#resume,
				Quit:    Scene.switchToReset,
				Restart: Game.#restart,
			}
		});
		Game.draw();
	}
	#update() {
		if (Window.resizing || BrickG.destroyed)
			return;
		Score.update();
		BrickG.update();
		Item.update();
		Army.update();
		Laser.update();
		BallG.update();
		Paddle.update();
		Demo.update();
	}
	draw() {
		ctx.clear();
		ctx.drawImage(cvsShadow, 0,0);
		ctx.drawImage(cvsBrick,  0,0);
		BrickG.animation();
		Army.draw();
		Item.draw();
		Laser.draw();
		BallG.draw();
		Paddle.draw();
		Army.Explosion.draw();
		Demo.draw();
		Score.draw();
		Lives.draw();
		Message.draw();
	}
	#mainLoop() {
		Game.#update();
		Game.draw();
	}
});
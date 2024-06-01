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
import {Message} from './message.js';
import {Score}   from './score.js';
import {Lives}   from './lives.js';
import {Paddle}  from './paddle.js';
import {BallG}   from './ball.js';
import {BrickG}  from './brick.js';
import {Army}    from './army.js';
import {Item}    from './item.js';
import {Laser}   from './laser.js';

const {cvs,ctx,cvsForBrick,cvsForShadow}= Cvs;

export const Game = freeze(new class {
	static {$ready(this.#setup)}
	static #setup() {
		Game.#reset();
		$(cvs).on({
			mousedown:   Game.#start,
			contextmenu: Game.#confirm,
		});
		$on({
			Reset:    Game.#reset,
			Clear:    Game.#clear,
			Respawn:  Game.#respawn,
			SelStage: Game.#selectStage,
		});
		$on({focus:   Game.#confirm});
		$on({blur:    Game.#confirm});
		$on({keydown: Game.#confirm});
		document.body.addClass('loaded');
	}
	ReadyTime  = 2200; // ms
	#respawned = false;
	get respawned() {return this.#respawned}

	#stageIdx = Menu.Stage.index;
	get stageIdx() {return this.#stageIdx}
	get stageNum() {return this.#stageIdx+1}

	get isReadyScene() {return Scene.isReset  || Scene.isReady}
	get isDemoScene()  {return Scene.isReset  || Scene.isInDemo}
	get isPlayScene()  {return Scene.isInDemo || Scene.isInGame}

	acceptEventInGame(e) {
		if (!e || e.button > 0 || !e.target)
			return false;
		if (!Scene.isInGame)
			return false;
		return (
			e.target == cvs || 
			e.target == document.body ||
			e.target == Window.board);
	}
	#selectStage(_, stageIdx) {
		Game.#stageIdx = stageIdx;
		Scene.switchToReset();
	}
	#reset() {
		Game.#stageIdx  = Menu.Stage.index;
		Game.#respawned = false;
		Game.#init();
		Scene.switchToInDemo(Game.ReadyTime);
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
		Scene.switchToReady();
		Game.#respawned = true;
		BallG.init();
		Paddle.init();
		Scene.switchToInGame(Game.ReadyTime);
	}
	#clear() {
		if (Game.stageNum == Stages.length) {
			Ticker.Timer.sequence(
				[1500, Scene.switchToGameOver],
				[1500, Scene.switchToReset]);
			BallG.init();
			return;
		}
		Ticker.Timer.set(2000, Game.#setNewStage);
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
			? 'Browser window is now inactive!'
			: 'Are you sure you want to quit the game?';

		e.preventDefault();
		Ticker.pause(true);
		Sound.pause();
		Confirm.open({
			content,
			cancelId:   'Resume',
			autoFocusId:'Resume',
			funcCfg: {
				Resume: Game.#resume,
				Quit:   Scene.switchToReset,
				Restart:Game.#restart,
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
	}
	draw() {
		ctx.clear();
		ctx.drawImage(cvsForShadow, 0,0);
		ctx.drawImage(cvsForBrick,  0,0);
		BrickG.animation();
		Army.draw();
		Item.draw();
		Laser.draw();
		BallG.draw();
		Paddle.draw();
		Army.Explosion.draw();
		Score.draw();
		Lives.draw();
		Message.draw();
	}
	#mainLoop() {
		Game.#update();
		Game.draw();
	}
});
import '../lib/wheel.js';
import {Ticker}   from '../lib/timer.js';
import {Confirm}  from '../lib/confirm.js';
import {Sound}    from '../snd/sound.js';
import {Window}   from './_window.js';
import * as Cvs   from './_canvas.js';
import * as Menu  from './menu.js';
import {Bg}       from './background.js';
import {Scene}    from './scene.js';
import {Stages}   from './stage.js';
import {Demo}     from './demo.js';
import {Message}  from './message.js';
import {Score}    from './score.js';
import {Lives}    from './lives.js';
import {Paddle}   from './paddle.js';
import {Sight}    from './sight.js';
import {BallMgr}  from './ball.js';
import {BrickMgr} from './brick.js';
import {Army}     from './army.js';
import {ItemMgr}  from './item.js';
import {Laser}    from './laser.js';

const {cvs,ctx,cvsBrick,cvsShadow}= Cvs;

export const Game = freeze(new class {
	static {$load(this.#setup)}
	static #setup() {
		$on({
			Reset:   Game.#reset,
			Clear:   Game.#clear,
			Respawn: Game.#respawn,
			focus:   Game.#confirm,
			blur:    Game.#confirm,
			keydown: Game.#confirm,
		});
		$(cvs).on({
			mousedown:   Game.#start,
			contextmenu: Game.#confirm,
		});
		$(Menu.StageMenu).on({Select: Game.#selectStage});
		Game.#reset();
	}
	ReadyTime  = 2500; // ms
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
		Bg.init();
		BallMgr.init();
		BrickMgr.init();
		Paddle.init();
		Ticker.set(Game.#mainLoop)
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
		if (e?.button > 0 || !Game.isDemoScene) return;
		Scene.switchToStart();
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
		BallMgr.init();
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
			Game.draw();
			return;
		}
		if (Confirm.opened)
			return;
		if (e.key  != 'Escape'
		 && e.type != 'blur'
		 && e.type != 'contextmenu')
			return;

		e.preventDefault();
		Ticker.pause(true);
		Sound.pause();
		Confirm.open({
			cancelId:    'Resume',
			autoFocusId: 'Resume',
			content: e.type == 'blur'
				? 'Browser window is\nnow inactive!'
				: 'You really want to\nquit the game?',
			funcCfg: {
				Resume:  Game.#resume,
				Quit:    Scene.switchToReset,
				Restart: Game.#restart,
			}
		});
		Game.draw();
	}
	#update() {
		if (BrickMgr.brokenAll)
			return;
		Score.update();
		BrickMgr.update();
		ItemMgr.update();
		Army.update();
		Laser.update();
		BallMgr.update();
		Sight.update();
		Paddle.update();
		Demo.update();
	}
	draw() {
		ctx.clear();
		ctx.drawImage(cvsShadow, 0,0);
		Sight.drawLine();
		ctx.drawImage(Bg.FrameImg, 0,0, cvs.width, cvs.height);
		ctx.drawImage(cvsBrick, 0,0);
		BrickMgr.animation();
		Sight.drawTarget();
		Army.draw();
		ItemMgr.draw();
		Laser.draw();
		BallMgr.draw();
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
import '../lib/wheel.js';
import {Ticker}   from '../lib/timer.js';
import {Confirm}  from '../lib/confirm.js';
import {Sound}    from '../snd/sound.js';
import {Window}   from './_window.js';
import * as Cvs   from './_canvas.js';
import * as Menu  from './menu.js';
import {BgMgr}    from './background.js';
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
			Start:   Game.#onStart,
			Ready:   Game.#onReady,
			Reset:   Game.#onReset,
			Clear:   Game.#onClear,
			Respawn: Game.#onRespawn,
			focus:   Game.#onPause,
			blur:    Game.#onPause,
			keydown: Game.#onPause,
		});
		$(cvs).on({
			mousedown:   Game.#onMousedown,
			contextmenu: Game.#onPause,
		});
		$(Menu.StageMenu).on({change: Game.#onSelectStage});
		Scene.switchToReset();
	}
	ReadyTime    = 2500; // ms
	#stageIdx    = Menu.StageMenu.index;
	#respawned   = false;
	#isDemoScene = false;
	get stageIdx()  {return this.#stageIdx}
	get stageNum()  {return this.#stageIdx+1}
	get respawned() {return this.#respawned}

	get isDemoScene()  {return this.#isDemoScene}
	get isReadyScene() {return Scene.isReset  || Scene.isReady}
	get isPlayScene()  {return Scene.isInDemo || Scene.isInGame}

	acceptEventInGame(e) {
		if (!e || !e.target || e.button == 1)
			return false;
		if (!Scene.isInGame)
			return false;
		return(e.target == cvs
			|| e.target == document.body
			|| e.target == Window.Board);
	}
	#init() {
		BgMgr.init();
		BallMgr.init();
		ItemMgr.init();
		BrickMgr.init();
		Paddle.init();
		Ticker.set(Game.#mainLoop);
	}
	#onSelectStage(_, stageIdx) {
		Game.#stageIdx = stageIdx;
		Scene.switchToReset();
	}
	#onMousedown(e) {
		if (Game.isDemoScene && e.button == 0)
			Scene.switchToStart();
	}
	#onReset() {
		Game.#stageIdx    = Menu.StageMenu.index;
		Game.#respawned   = false;
		Game.#isDemoScene = true;
		Game.#init();
		Scene.switchToInDemo(Game.ReadyTime+500);
	}
	#onStart(e) {
		Game.#isDemoScene = false;
		Game.#init();
		Sound.stop().play('start');
		Scene.switchToReady();
	}
	#onRespawn() {
		Game.#respawned = true;
		BallMgr.init();
		Paddle.init();
		Scene.switchToReady();
	}
	#onReady() {
		Scene.switchToInGame(Game.ReadyTime);
	}
	#onClear() {
		(Game.stageNum == Stages.length)
			? Ticker.Timer.sequence(
				[1500, Scene.switchToGameOver],
				[1500, Scene.switchToReset])
			: Ticker.Timer.set(2000, Game.#setNewStage);
	}
	#onPause(e) {
		if (Game.isDemoScene) {
			/blur|focus/.test(e.type)
			 && Ticker.pause(e.type == 'blur')
			 && Game.#draw();
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
		Sound.pauseAll(true);
		Confirm.open({
			content: e.type == 'blur'
				? 'Browser window is\nnow inactive!'
				: 'You really want to\nquit the game?',
			buttons: {
				Resume:  {fn:Game.#resume, cancel:true, autoFocus:true},
				Quit:    {fn:Scene.switchToReset},
				Restart: {fn:Game.#restart},
			}
		});
		Game.#draw();
	}
	#resume() {
		Ticker.pause(false);
		Sound.pauseAll(false);
		$trigger('Resume');
	}
	#restart() {
		Scene.switchToReset();
		Scene.switchToStart();
	}
	#setNewStage() {
		Game.#stageIdx++;
		Game.#respawned = false;
		Game.#init();
		Scene.switchToReady();
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
	#draw() {
		ctx.clear();
		ctx.drawImage(cvsShadow, 0,0);
		Sight.drawLine();
		ctx.drawImage(BgMgr.FrameImg, 0,0);
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
		Game.#draw();
	}
});
import './ghosts/ghost_sub.js'
import {Sound}    from '../_snd/sound.js'
import {Confirm}  from '../_lib/confirm.js'
import {Cursor}   from '../_lib/mouse.js'
import * as _Menu from '../_lib/menu.js'
import {State}    from './state.js'
import {Ctrl}     from './control.js'
import {Maze}     from './maze.js'
import {Wall}     from './sprites/wall.js'
import {Message}  from './message.js'
import {Score}    from './score.js'
import {Lives}    from './lives.js'
import {Fruit}    from './fruit.js'
import {Player}   from './pacman.js'
import {GhsMgr}   from './ghosts/_system.js'
import {PtsMgr}   from './points.js'
import {Attract}  from './demo/attract.js'
import {CoffBrk}   from './demo/coffee_break.js'

export const Menu = freeze({
	LevelMenu:  new _Menu.DorpDown('LevelMenu'),
	ExtendMenu: new _Menu.Slide('ExtendMenu'),
})
export const Game = new class {
	static {$ready(this.setup)}
	static setup() {
		$on({
			blur:()=> Game.#pause(true),
			keydown:  Game.#onKeydown,
			Title:    Game.#onTitle,
			Start:    Game.#onStart,
			Playing:  Game.#onPlaying,
			Clear:    Game.#onClear,
			FlashMaze:Game.#onFlashMaze,
			NewLevel: Game.#onNewLevel,
			Losing:   Game.#onLosing,
			Restart:  Game.#levelBegins,
			GameOver: Game.#levelEnds,
			Quit:     Game.#levelEnds,
		})
		Menu.LevelMenu.bindChange(Game.#resetLevel)
		State.switchToTitle()
 	}
	#level = 1
	#restarted = false
	get level()     {return Game.#level}
	get levelStr()  {return Game.#level.toString().padStart(2,0)}
	get restarted() {return Game.#restarted}

	// Divide the speed equally with level 13+ as the fastest
	get clampedLv() {return clamp(Game.level, 1, 13) || 1}
	get speedByLv() {return 1 - (13-Game.clampedLv) * .01}
	get speedRate() {return State.isPlaying? Ctrl.speedRate : 1}
	get interval()  {return Game.speedRate * Ticker.Interval}
	get moveSpeed() {return Game.speedRate * Game.speedByLv}

	#resetLevel() {
		Game.#setLevel(Menu.LevelMenu.index+1)
	}
	#setLevel(i=1) {
		Game.#level = between(i, 1, 0xFF) && +i || 1
		$trigger('LevelChanged')
	}
	#confirm() {
		if (!State.isPlaying) return
		if (!Ticker.paused) Game.#pause()
		Confirm.open('Are you sure you want to quit the game?',
			Game.#pause, State.switchToQuit, 'Resume','Quit', 0)
	}
	#pause(force) {
		if (!State.isPlaying) return
		Sound.allPaused = Ticker.pause(force)
	}
	#onKeydown(e) {
		if (Confirm.opened) return
		if (e.originalEvent.repeat) return
		switch (e.key) {
		case 'Escape':
			Game.#pause()
			break
		case 'Delete':
			!e.ctrlKey
				? Game.#confirm()
				: State.switchToQuit()
			break
		default:
			if (dqs(':not(#startBtn):focus')) break
			if (Dir.from(e, {wasd:true}) || e.key=='\x20') {
				State.isTitle && State.switchToStart()
				Ticker.paused && Game.#pause()
			}
		}
	}
	#onTitle() {
		Cursor.default()
		Sound.stop()
		Game.#resetLevel()
		Ticker.set(Game.#loop, Game.#pausing)
	}
	#onStart() {
		Cursor.hide()
		Sound.play('start')
		Timer.set(2200, Game.#levelBegins)
	}
	#onPlaying() {
		!document.hasFocus() && Game.#pause(true)
	}
	#onLosing() {
		Sound.play('losing')
		Player.sprite.setLosing()
		Lives.left > 0
			? State.switchToRestart ({delay:2200})
			: State.switchToGameOver({delay:2000})
	}
	#onClear() {
		Sound.stopLoops()
		State.switchToFlashMaze({delay:1000})
	}
	#onFlashMaze() {
		let count = 0
		!function redraw() {
			if (++count > 8)
				return Timer.set(500, Game.#levelEnds)
			Wall.draw([, Color.FlashWall][count % 2])
			Timer.set(250, redraw)
		}()
	}
	#onNewLevel() {
		Game.#setLevel(Game.level+1)
		Game.#levelBegins()
	}
	#levelBegins() {
		Game.#restarted = State.isRestart
		State.switchToReady()
		State.switchToPlaying({delay:2200})
	}
	#levelEnds() {
		Game.#restarted = false
		if (State.isQuit) {
			Ticker.pause(false)
			Wall.draw()
			State.switchToTitle()
			return
		}
		if (State.isGameOver) {
			State.switchToTitle({delay:2500})
			return
		}
		if (State.isFlashMaze) {
			if (!Ctrl.consecutive) {
				State.switchToTitle()
				return
			}
			!Ctrl.isPractice && CoffBrk.begin()
				|| State.switchToNewLevel()
		}
	}
	#update() {
		Player.instance.update()
		GhsMgr.update()
		PtsMgr.update()
		Fruit.update()
		Attract.update()
		CoffBrk.update()
	}
	#draw() {
		Ctx.clear()
		Ctrl.drawGridLines()
		Attract.draw() ||
		CoffBrk.draw() ||
		Game.#drawMain()
	}
	#drawMain() {
		Ctx.drawImage(Bg.cvs, 0,0)
		Maze.drawDoor()
		Ctrl.drawInfo()
		Score.draw()
		Maze.PowDot.draw()
		Fruit.drawTarget()
		PtsMgr.drawFruitPts()
		GhsMgr.drawBehind()
		Player.instance.draw()
		GhsMgr.drawTargets()
		GhsMgr.drawFront()
		PtsMgr.drawGhostPts()
		Message.draw()
	}
	#pausing() {
		Game.#draw()
	}
	#loop() {
		Game.#update()
		Game.#draw()
	}
};$load(()=> document.body.dataset.loaded = true)
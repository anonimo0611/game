import './ghosts/_ghost_sub.js'
import {Sound}     from '../_snd/sound.js'
import {Confirm}   from '../_lib/confirm.js'
import {Cursor}    from '../_lib/mouse.js'
import {LevelMenu} from './_menu.js'
import {State}     from './_state.js'
import {Ctrl}      from './control.js'
import {Maze}      from './maze.js'
import {MazeWall}  from './maze_wall.js'
import {Message}   from './message.js'
import {Score}     from './score.js'
import {Lives}     from './lives.js'
import {Fruit}     from './fruit.js'
import {Player}    from './pacman/_pacman.js'
import {GhsMgr}    from './ghosts/_system.js'
import {PtsMgr}    from './points.js'
import {Attract}   from './demo/attract.js'
import {CBreak}    from './demo/coffee_break.js'

export const Game = new class {
	static {$ready(this.setup)}
	static setup() {
		$on('blur',()=> Game.#pause(true))
		$on('keydown',  Game.#onKeydown)
		$on('Title',    Game.#onTitle)
		$on('Start',    Game.#onStart)
		$on('Playing',  Game.#onPlaying)
		$on('FlashMaze',Game.#onFlashMaze)
		$on('NewLevel', Game.#onNewLevel)
		$on('Losing',   Game.#onLosing)
		$on('Restart',  Game.#levelBegins)
		$on('GameOver', Game.#levelEnds)
		$on('Quit',     Game.#levelEnds)
		LevelMenu.bindChange(Game.#resetLevel)
		State.switchToTitle()
 	}
	#level = 1
	#restarted = false
	get level()     {return Game.#level}
	get restarted() {return Game.#restarted}

	// Divide the speed equally with level 13+ as the fastest
	get clampedLv() {return clamp(Game.level, 1, 13) || 1}
	get speedByLv() {return 1 - (13-Game.clampedLv) * .01}
	get speedRate() {return State.isPlaying? Ctrl.speedRate : 1}
	get interval()  {return Game.speedRate * Ticker.Interval}
	get moveSpeed() {return Game.speedRate * Game.speedByLv}

	#resetLevel() {
		Game.#setLevel(LevelMenu.index+1)
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
		Sound.pauseAll(Ticker.pause(force))
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
	#onFlashMaze() {
		let count = 0
		!function redraw() {
			if (++count > 8)
				return Timer.set(500, Game.#levelEnds)
			MazeWall.draw([, '#FFF'][count % 2])
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
			MazeWall.draw()
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
			!Ctrl.isPractice && CBreak.begin()
				|| State.switchToNewLevel()
		}
	}
	#update() {
		Player.instance.update()
		GhsMgr.update()
		PtsMgr.update()
		Fruit.update()
		State.isTitle   && Attract.Timer.update()
		State.isAttract && Attract.update()
		State.isCBreak  && CBreak.update()
	}
	#draw() {
		Ctx.clear()
		Ctrl.drawGridLines()
		if (State.isAttract) return this.#drawAttractMode()
		if (State.isCBreak)  return this.#drawCoffeeBreak()
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
	#drawAttractMode() {
		Fruit.drawLevelCounter()
		Score.draw()
		Attract.draw()
		PtsMgr.drawGhostPts()
	}
	#drawCoffeeBreak() {
		State.lastIs('FlashMaze')
			&& Fruit.drawLevelCounter()
		CBreak.draw()
	}
	#pausing() {
		Game.#draw()
	}
	#loop() {
		Game.#update()
		Game.#draw()
	}
};$load(()=> document.body.dataset.loaded = true)
import './ghosts/ghost_sub.js'
import {Sound}     from '../_snd/sound.js'
import {Confirm}   from '../_lib/confirm.js'
import {Ticker}    from '../_lib/timer.js'
import {Timer}     from '../_lib/timer.js'
import {Dir}       from '../_lib/direction.js'
import {Cursor}    from '../_lib/mouse.js'
import {LevelMenu} from './_menu.js'
import {Ctx}       from './_canvas.js'
import {State}     from './_state.js'
import {Ctrl}      from './control.js'
import {Maze}      from './maze.js'
import {MazeWall}  from './maze_wall.js'
import {Message}   from './message.js'
import {Score}     from './score.js'
import {Lives}     from './lives.js'
import {Pacman}    from './pacman/pac.js'
import {GhostMgr}  from './ghosts/_system.js'
import {Target}    from './ghosts/show_targets.js'
import {Fruit}     from './fruit.js'
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
		LevelMenu.bindEvent(Game.#resetLevel)
		Game.#resetLevel()
		Game.#initStartBtn()
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

	#initStartBtn() {
		$('#startBtn').on('click', State.switchToStart)
	}
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
			if (Dir.from(e, {awsd:true}) || e.key=='\x20') {
				State.isTitle && State.switchToStart()
				Ticker.paused && Game.#pause()
			}
		}
	}
	#pause(force) {
		if (!State.isPlaying) return
		Ticker.pause(force) && $trigger('Pause')
		Sound.pauseAll(Ticker.paused)
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
		Timer.set(500, ()=> {
			Sound.play('losing')
			Pacman.instance.sprite.setLosing()
			Lives.left > 0
				? State.switchToRestart(2200)
				: State.switchToGameOver(2200)
		})
	}
	#onFlashMaze() {
		let count = 0
		function redraw() {
			if (++count > 8)
				return Timer.set(500, Game.#levelEnds)
			MazeWall.draw([, '#FFF'][count % 2])
			Timer.set(250, redraw)
		}redraw()
	}
	#onNewLevel() {
		Game.#setLevel(Game.level+1)
		Game.#levelBegins()
	}
	#levelBegins() {
		Game.#restarted = State.isRestart
		State.switchToReady()
		State.switchToPlaying(2200)
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
			State.switchToTitle(2500)
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
		PtsMgr.update()
		Pacman.instance.update()
		GhostMgr.update()
		Fruit.update()
		State.isTitle   && Attract.Timer.update()
		State.isAttract && Attract.update()
		State.isCBreak  && CBreak.update()
	}
	#draw() {
		Ctx.clear()
		if (State.isAttract) return this.#drawAttractMode()
		if (State.isCBreak)  return this.#drawCoffeeBreak()
		Maze.drawDoor()
		Ctrl.drawGridLines()
		Ctrl.drawInfo()
		Score.draw()
		Maze.PowDot.draw()
		Fruit.drawTarget()
		PtsMgr.drawFruitPts()
		GhostMgr.drawBehind()
		Pacman.instance.draw()
		Target.draw()
		GhostMgr.drawFront()
		PtsMgr.drawGhostPts()
		Message.draw()
	}
	#drawAttractMode() {
		Fruit.drawLevelCounter()
		Ctrl.drawGridLines()
		Score.draw()
		Attract.draw()
		PtsMgr.drawGhostPts()
	}
	#drawCoffeeBreak() {
		State.lastIs('FlashMaze')
			&& Fruit.drawLevelCounter()
		Ctrl.drawGridLines()
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
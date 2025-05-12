import '../_lib/_canvas.js'
import './ghosts/ghost_sub.js'
import {Sound}    from '../_snd/sound.js'
import {Confirm}  from '../_lib/confirm.js'
import {Cursor}   from '../_lib/mouse.js'
import * as _Menu from '../_lib/menu.js'
import {Dir}      from '../_lib/direction.js'
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
import {CoffBrk}  from './demo/coffee_break.js'

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
		Menu.LevelMenu.bind({change:Game.#resetLevel})
		State.to('Title')
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
		Game.#setLevel(Menu.LevelMenu.index+1)
	}
	#setLevel(i=1) {
		Game.#level = between(i, 1, 0xFF) && +i || 1
		$('#level').text(`Level${String(Game.level).padStart(2,'0')}`)
		$trigger('LevelChanged')
	}
	#confirm() {
		if (!State.isPlaying)
			return
		!Ticker.paused && Game.#pause()
		Confirm.open('Are you sure you want to quit the game?',
			Game.#pause, ()=> State.to('Quit'), 'Resume','Quit', 0)
	}
	/** @param {boolean} [force] */
	#pause(force) {
		if (State.isPlaying)
			Sound.allPaused = Ticker.pause(force)
	}
	/** @param {KeyboardEvent} e */
	#onKeydown(e) {
		if (Confirm.opened || keyRepeat(e))
			return
		switch (e.key) {
		case 'Escape': return Game.#pause()
		case 'Delete': return function() {
			!e.ctrlKey
				? Game.#confirm()
				: State.to('Quit')
			}()
		default:
			if (qS(':not(#startBtn):focus') == null
			 && Dir.from(e,{wasd:true}) || e.key == '\x20') {
				State.isTitle && State.to('Start')
				Ticker.paused && Game.#pause()
			}
		}
	}
	#onTitle() {
		Cursor.default()
		Sound.stop()
		Game.#resetLevel()
		Ticker.set(Game.#loop, Game.#draw)
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
		Player.i.sprite.setLosing()
		Lives.left > 0
			? State.to('Restart', {delay:2200})
			: State.to('GameOver',{delay:2000})
	}
	#onClear() {
		Sound.stopLoops()
		State.to('FlashMaze',{delay:1000})
	}
	#onFlashMaze() {
		let count = 0
		;(function redraw() {
			if (++count > 8)
				return Timer.set(500, Game.#levelEnds)
			Wall.draw([, Color.FlashWall][count % 2])
			Timer.set(250, redraw)
		})()
	}
	#onNewLevel() {
		Game.#setLevel(Game.level+1)
		Game.#levelBegins()
	}
	#levelBegins() {
		Game.#restarted = State.isRestart
		State.to('Ready').to('Playing',{delay:2200})
	}
	#levelEnds() {
		Game.#restarted = false
		if (State.isQuit) {
			Ticker.pause(false)
			Wall.draw()
			State.to('Title')
			return
		}
		if (State.isGameOver) {
			State.to('Title',{delay:2500})
			return
		}
		if (State.isFlashMaze) {
			if (!Ctrl.consecutive) {
				State.to('Title')
				return
			}
			const intermissionLv = +{2:1, 5:2, 9:3}[Game.level]
			Ctrl.isPractice || !intermissionLv
				? State.to('NewLevel')
				: State.to('CoffBrk',{data:intermissionLv})
		}
	}
	#update() {
		Player.i.update()
		GhsMgr.update()
		PtsMgr.update()
		Fruit.update()
		Attract.update()
		CoffBrk.update()
	}
	#draw() {
		Ctx.clear()
		Ctrl.drawGrid()
		Attract.draw() ||
		CoffBrk.draw() ||
		Game.#drawMain()
	}
	#drawMain() {
		Score.draw()
		Maze.PowDot.draw()
		Fruit.drawTarget()
		PtsMgr.drawBehind()
		GhsMgr.drawBehind()
		Player.i.draw()
		GhsMgr.drawTarget()
		GhsMgr.drawFront()
		PtsMgr.drawFront()
		Message.draw()
	}
	#loop() {
		Game.#update()
		Game.#draw()

	}
};$load(()=> document.body.dataset.loaded = 'true')
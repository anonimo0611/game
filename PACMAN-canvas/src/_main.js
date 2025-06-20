import './ghosts/ghost_sub.js'
import {Sound}   from '../_snd/sound.js'
import {Confirm} from '../_lib/confirm.js'
import {Cursor}  from '../_lib/mouse.js'
import {Dir}     from '../_lib/direction.js'
import {State}   from './state.js'
import {Ctrl}    from './control.js'
import {Menu}    from './ui.js'
import {Maze}    from './maze.js'
import {Wall}    from './sprites/wall.js'
import {Message} from './message.js'
import {Score}   from './score.js'
import {Lives}   from './lives.js'
import {Fruit}   from './fruit.js'
import {Actor}   from './actor.js'
import {Player}  from './pacman.js'
import {PtsMgr}  from './points.js'
import {Attract} from './demo/attract.js'
import {CoffBrk} from './demo/coffee_break.js'

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
			GameOver: Game.#onGameOver,
			Quit:     Game.#onQuit,
			Restart:  Game.#levelBegins,
		})
		Menu.Level.on({change:Game.#resetLevel})
		State.to('Title')
	}
	#level = 1
	#restarted = false

	get level()     {return Game.#level}
	get levelStr()  {return Game.#level.toString().padStart(2,'0')}
	get restarted() {return Game.#restarted}

	/** Level 13+ as the fastest, stepwise faster from level 1 to 13 */
	get speedByLv() {return 1 - (13-Game.clampedLv) * .01}
	get clampedLv() {return clamp(Game.level, 1, 13)}
	get speedRate() {return State.isPlaying ? Ctrl.speedRate : 1}
	get interval()  {return Game.speedRate * Ticker.Interval}
	get moveSpeed() {return Game.speedRate * Game.speedByLv}

	#resetLevel() {
		Game.#restarted = false
		Game.#setLevel(Menu.Level.index+1)
	}
	#setLevel(i=1) {
		Game.#level = between(i, 1, 0xFF) && +i || 1
		$level.text('Level'+this.levelStr).trigger('change')
	}
	#confirm() {
		!Ticker.paused && Game.#pause()
		Confirm.open('Are you sure you want to quit the game?',
			Game.#pause, ()=> State.to('Quit'), 'Resume','Quit', 0)
	}
	/** @param {boolean} [force] */
	#pause(force) {
		State.isPlaying && Sound.paused(Ticker.pause(force))
	}
	/** @param {KeyboardEvent} e */
	#onKeydown(e) {
		if (!Sound.loaded || Confirm.opened || keyRepeat(e))
			return
		switch(e.key) {
		case 'Escape':
			Game.#pause()
			break
		case 'Delete':
			e.ctrlKey
				? State.to('Quit')
				: State.isPlaying && Game.#confirm()
			break
		default:
			if (qS(':not(#startBtn):focus')) break
			if (Dir.from(e,{wasd:true}) || e.key == '\x20') {
				State.isTitle && State.to('Start')
				Ticker.paused && Game.#pause()
			}
		}
	}
	#onTitle() {
		Cursor.default()
		Sound.stop()
		Game.#resetLevel()
		Ticker.set(Game.#update, Game.#draw)
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
		Player.instance.sprite.setLosing()
		Lives.left > 0
			? State.to('Restart', {delay:2200})
			: State.to('GameOver',{delay:2000})
	}
	#onClear() {
		Sound.stopLoops()
		State.to('FlashMaze', {delay:1000})
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
	#onGameOver() {
		State.to('Title', {delay:2500})
	}
	#onQuit() {
		Ticker.stop()
		State.to('Title')
	}
	#levelBegins() {
		Game.#restarted = State.isRestart
		State.to('Ready').to('Playing', {delay:2200})
	}
	#levelEnds() {
		Game.#restarted = false
		if (!Ctrl.consecutive) {
			State.to('Title')
			return
		}
		const imLv = CoffBrk.intermissionLevel
		Ctrl.isPractice || imLv < 0
			? State.to('NewLevel')
			: State.to('CoffBrk', {data:imLv})
	}
	#update() {
		PtsMgr.update()
		Fruit.update()
		Actor.update()
		Attract.update()
		CoffBrk.update()
	}
	#draw() {
		Ctx.clear()
		Ctrl.draw()
		Attract.draw() ||
		CoffBrk.draw() ||
		Game.#drawMain()
	}
	#drawMain() {
		Score.draw()
		Maze.PowDot.draw()
		Fruit.draw()
		Actor.draw()
		Message.draw()
	}
}, $level = $byId('level')
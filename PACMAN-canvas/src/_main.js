import './ghosts/ghost_sub.js'
import {Cursor}    from '../_lib/mouse.js'
import {Sound}     from '../_snd/sound.js'
import {Menu}      from './ui.js'
import {State}     from './state.js'
import {Message}   from './message.js'
import {Ctrl}      from './control.js'
import {Form}      from './control.js'
import {Maze}      from './maze.js'
import {Wall}      from './sprites/wall.js'
import {Score}     from './score.js'
import {Lives}     from './lives.js'
import {Fruit}     from './fruit.js'
import {Actor}     from './actor.js'
import {player}    from './player/player.js'
import {PtsMgr}    from './points.js'
import {Attract}   from './demo/attract.js'
import {CoffBreak} from './demo/coffee_break.js'

export const Game = new class {
	static {$(this.setup)}
	static setup() {
		State.on({
			Title:    Game.#onTitle,
			Intro:    Game.#onIntro,
			InGame:   Game.#onInGame,
			Cleared:  Game.#onCleared,
			Flashing: Game.#onFlashing,
			NewLevel: Game.#onNewLevel,
			PacDying: Game.#onPacDying,
			GameOver: Game.#onGameOver,
			Quit:     Game.#onQuit,
			Restarted:Game.#levelBegins,
		})
		.toTitle()
		Menu.Level.on({change:Game.#resetLevel})
	}
	#level = 1
	#restarted = false

	get level()     {return Game.#level}
	get levelStr()  {return Game.#level.toString().padStart(2,'0')}
	get restarted() {return Game.#restarted}

	/** Level 13+ as the fastest, stepwise faster from level 1 to 13 */
	get speedByLv() {return 1 - (13-Game.clampedLv) * .01}
	get clampedLv() {return clamp(Game.level, 1, 13)}
	get speed()     {return State.isInGame ? Ctrl.speed : 1}
	get moveSpeed() {return Game.speed * Game.speedByLv}
	get interval()  {return Game.speed * Ticker.Interval}

	#resetLevel() {
		Game.#restarted = false
		Game.#setLevel(Menu.Level.index+1)
	}
	#setLevel(i=1) {
		Game.#level = between(i, 1, 0xFF) && +i || 1
		$Level.text('Level'+this.levelStr).trigger('change')
	}
	#onTitle() {
		Cursor.default()
		Sound.stop()
		Game.#resetLevel()
		Ticker.set(Game.#update, Game.#draw)
	}
	#onIntro() {
		Cursor.hide()
		Sound.play('start')
		Timer.set(2200, Game.#levelBegins)
	}
	#onInGame() {
		!document.hasFocus() && Ctrl.pause(true)
	}
	#onPacDying() {
		Sound.play('dying')
		player.sprite.setDying()
		Lives.left > 0
			? State.toRestart ({delay:2200})
			: State.toGameOver({delay:2000})
	}
	#onCleared() {
		Sound.stopLoops()
		State.toFlashing({delay:1000})
	}
	#onFlashing() {
		Wall.flashing(Game.#levelEnds)
	}
	#onNewLevel() {
		Game.#setLevel(Game.level+1)
		Game.#levelBegins()
	}
	#onGameOver() {
		State.toTitle({delay:2500})
	}
	#onQuit() {
		Ticker.stop()
		State.toTitle()
	}
	#levelBegins() {
		Game.#restarted = State.isRestarted
		State.toReady().toInGame({delay:2200})
	}
	#levelEnds() {
		Game.#restarted = false
		if (!Ctrl.endlessMode) {
			State.toTitle()
			return
		}
		CoffBreak.number < 0
			? State.toNewLevel()
			: State.toCoffBreak()
	}
	#update() {
		PtsMgr.update()
		Fruit.update()
		Actor.update()
		Attract.update()
		CoffBreak.update()
	}
	#draw() {
		Ctx.clear()
		Maze.drawGrid()
		Attract.draw()   ||
		CoffBreak.draw() ||
		Game.#drawMain()
	}
	#drawMain() {
		Score.draw()
		Maze.PowDot.draw()
		Fruit.drawTarget()
		Actor.draw()
		Message.draw()
	}
},
$Level = $byId('level')
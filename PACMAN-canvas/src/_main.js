import './ghosts/ghost_sub.js'
import {Cursor}  from '../_lib/mouse.js'
import {Menu}    from './ui.js'
import {State}   from './state.js'
import {Message} from './message.js'
import {Ctrl}    from './control.js'
import {Maze}    from './maze.js'
import {Wall}    from './sprites/wall.js'
import {Score}   from './score.js'
import {Lives}   from './lives.js'
import {Fruit}   from './fruit.js'
import {Actors}  from './actor.js'
import {Player}  from './player/player.js'
import {PtsMgr}  from './points.js'
import {Demo}    from './demo/_demo.js'
import {Sound}   from '../_snd/sound.js'

export const Game = new class {
	static {$(this.setup)}
	static setup() {
		Ticker.set(Game.#update, Game.#draw)
		State.on({
			Quit:     Game.#onQuit,
			Title:    Game.#onTitle,
			Intro:    Game.#onIntro,
			Ready:    Game.#onReady,
			InGame:   Game.#onInGame,
			NewLevel: Game.#onNewLevel,
			Cleared:  Game.#onRoundEnds,
			PacDying: Game.#onRoundEnds,
			Flashing: Game.#onFlashing,
			GameOver: Game.#onGameOver,
		})
		.toTitle()
		Menu.Level.onChange(Game.#resetLevel)
	}
	#level  = 1
	#isDied = false

	get level()     {return Game.#level}
	get levelStr()  {return Game.#level.toString().padStart(2,'0')}
	get isDied()    {return Game.#isDied}

	/** Level 13+ as the fastest, stepwise faster from level 1 to 13 */
	get speedByLv() {return 1 - (13-Game.clampedLv) * .01}
	get clampedLv() {return clamp(Game.level, 1, 13)}
	get speed()     {return State.isInGame? Ctrl.speed : 1}
	get interval()  {return Game.speed * Ticker.Interval}
	get moveSpeed() {return Game.speed * Game.speedByLv}

	#resetLevel() {
		Game.#setLevel(Menu.Level.index+1)
	}
	#setLevel(i=1) {
		Game.#level = between(i, 1, 0xFF) && +i || 1
		$Level.text('Level'+this.levelStr).trigger('change')
	}
	#onTitle() {
		Ticker.reset()
		Sound.stop()
		Cursor.show()
		Game.#resetLevel()
	}
	#onIntro() {
		Cursor.hide()
		Sound.playStartBGM()
		State.toReady({delay:2200})
	}
	#onReady() {
		State.toInGame({delay:2200})
	}
	#onInGame() {
		!document.hasFocus() && Ctrl.pause(true)
	}
	#onRoundEnds() {
		State.toRoundEnds()
		State.isCleared
			? Game.#onCleared()
			: Timer.set(600, Game.#die)
	}
	#die() {
		Game.#isDied = true
		Sound.playDyingSE()
		Player.sprite.startDying({fn:Game.#onDied})
	}
	#onDied() {
		Lives.left > 0
			? State.toReady()
			: State.toGameOver()
	}
	#onCleared() {
		Sound.stopLoops()
		State.toFlashing({delay:1000})
	}
	#onFlashing() {
		Wall.setFlashing(Game.#levelEnds)
	}
	#onNewLevel() {
		Game.#setLevel(Game.level+1)
		State.toReady()
	}
	#onGameOver() {
		State.toQuit({delay:2000})
	}
	#onQuit() {
		Game.#isDied = false
		Ticker.reset()
		State.toTitle()
	}
	#levelEnds() {
		Game.#isDied = false
		if (!Ctrl.endlessMode) {
			Game.#onQuit()
			return
		}
		Demo.CoffBreakNum < 0
			? State.toNewLevel()
			: State.toCoffBreak()
	}
	#update() {
		PtsMgr.update()
		Fruit.update()
		Maze.PowDots.update()
		Demo.update()
		Actors.update()
	}
	#draw() {
		Fg.clear()
		State.isDemoMode
			? Demo.draw()
			: Game.#drawMain()
	}
	#drawMain() {
		Score.draw()
		Maze.PowDots.draw()
		Fruit.drawTarget()
		Actors.draw(Player.core)
		Message.draw()
	}
},
$Level = $byId('level')
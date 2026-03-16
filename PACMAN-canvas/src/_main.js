import './ghosts/ghost_sub.js'
import {Cursor}  from '../_lib/mouse.js'
import {Menu, WinState}    from './ui.js'
import {State}   from './state.js'
import {Message} from './message.js'
import {Ctrl}    from './control.js'
import {Demo}    from './demo/_demo.js'
import {Maze}    from './maze.js'
import {Wall}    from './sprites/wall.js'
import {Score}   from './score.js'
import {Lives}   from './lives.js'
import {Fruit}   from './fruit.js'
import {Actors}  from './actor.js'
import {player}  from './player/player.js'
import {PtsMgr}  from './points.js'
import {Sound}   from '../_snd/sound.js'

export const Game = new class {
	static {$(this.setup)}
	static setup() {
		Ticker.set(Game.#update, Game.#draw)
		State.on({
			Quit:      Game.#onQuit,
			Title:     Game.#onTitle,
			Intro:     Game.#onIntro,
			Ready:     Game.#onReady,
			NewLevel:  Game.#onNewLevel,
			RoundEnds: Game.#onRoundEnds,
			Cleared:   Game.#onCleared,
			PacDying:  Game.#onPacDying,
			Flashing:  Game.#onFlashing,
			GameOver:  Game.#onGameOver,
		})
		.setTitle()
		Menu.Level.onChange(Game.#resetLevel)
	}
	#level   = 1
	#started = false
	#pacDied = false

	get level()     {return Game.#level}
	get levelStr()  {return Game.#level.toString().padStart(2,'0')}
	get started()   {return Game.#started}
	get pacDied()   {return Game.#pacDied}

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
		Sound
		Sound.stop()
		Cursor.show()
		Game.#resetLevel()
		Game.#started = false
	}
	#onIntro() {
		Cursor.hide()
		Sound.playStartBGM()
		State.setReady({delay:2200})
		Game.#started = true
	}
	#onNewLevel() {
		Game.#setLevel(Game.level+1)
		State.setReady()
	}
	#onReady() {
		State.setInGame({delay:2200})
	}
	#onRoundEnds() {
		Maze.dotsLeft == 0
			? State.setCleared()
			: State.setPacDying({delay:600})
	}
	#onPacDying() {
		Sound.playDyingSE()
		player.sprite.startDying(Game.#onPacDied)
	}
	#onPacDied() {
		(Game.#pacDied = Lives.left > 0)
			? State.setReady()
			: State.setGameOver()
	}
	#onCleared() {
		Sound.stopLoops()
		State.setFlashing({delay:1000})
	}
	#onFlashing() {
		Wall.setFlashing(Game.#levelEnds)
	}
	#levelEnds() {
		Game.#pacDied = false
		if (!Ctrl.endlessMode) {
			State.setTitle()
			return
		}
		Demo.CoffBreakNum < 0
			? State.setNewLevel()
			: State.setCoffBreak()
	}
	#onQuit() {
		Game.#pacDied = false
		State.setTitle()
	}
	#onGameOver() {
		State.setTitle({delay:2000})
	}
	#update() {
		PtsMgr.update()
		Fruit.update()
		Maze.PowDots.update()
		Demo.update()
		Actors.update()
		//$('#debug').text(WinState.active)
	}
	#draw() {
		Fg.clear()
		State.isDemoMode
			? Demo.draw()
			: Game.#drawMain()
		Message.draw()
	}
	#drawMain() {
		Score.draw()
		Maze.PowDots.draw()
		Fruit.drawTarget()
		Actors.draw(player)
	}
},
$Level = $('#level')
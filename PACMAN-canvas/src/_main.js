import './ghosts/ghost_sub.js'
import {Cursor}   from '../_lib/mouse.js'
import {Sound}    from '../_snd/sound.js'
import {Menu}     from './ui.js'
import {State}    from './state.js'
import {Message}  from './message.js'
import {Ctrl}     from './control.js'
import {Demo}     from './demo/_demo.js'
import {Lives}    from './lives.js'
import {Wall}     from './sprites/wall.js'
import {MazeMgr}  from './maze.js'
import {ScoreMgr} from './score.js'
import {FruitMgr} from './fruit.js'
import {PtsMgr}   from './points.js'
import {Actors}   from './actor.js'
import {player}   from './player/player.js'

const SPEED_STEP_PER_LV = 0.1

export const Game = new class GameCore {
	static {$(this.setup)}
	static setup() {
		Ticker.set(Game.#update, Game.#draw)
		Menu.Level.onChange(Game.#resetLevel)
		State.on({
			Quit: ()=> State.setTitle(),
			Intro:     Game.#onIntro,
			Ready:     Game.#onReady,
			NewLevel:  Game.#onNewLevel,
			RoundEnds: Game.#onRoundEnds,
			Cleared:   Game.#onCleared,
			PacDying:  Game.#onPacDying,
			Flashing:  Game.#onFlashing,
			GameOver:  Game.#onGameOver,
		})
		.onBefore({Title:Game.#reset}).setTitle()
	}
	#level   = 1
	#started = false
	#pacDied = false

	get level()     {return Game.#level}
	get started()   {return Game.#started}
	get pacDied()   {return Game.#pacDied}

	/** Levels 1-13 scale in difficulty. Level 13 is the maximum difficulty cap */
	get speedByLv() {return 1 - (13 - Game.clampedLv) * SPEED_STEP_PER_LV}
	get clampedLv() {return clamp(Game.level, 1, 13)}
	get speed()     {return State.isInGame? Ctrl.speed : 1}
	get interval()  {return Game.speed * Ticker.Interval}
	get moveSpeed() {return Game.speed * Game.speedByLv}

	#setLevel(n=1) {
		const lv = (Game.#level = between(n, 1, 0xFF) && n || 1)
		Level.val( String(lv).padStart(2,'0') ).trigger('change')
	}
	#resetLevel() {
		Game.#setLevel(Menu.Level.index+1)
	}
	#reset() {
		Ticker.reset()
		Sound.stop()
		Cursor.show()
		Game.#started = false
		Game.#pacDied = false
		Game.#resetLevel()
	}
	#onIntro() {
		Cursor.hide()
		Sound.playStartup()
		Game.#started = true
		State.setReady({delay:2200})
	}
	#onNewLevel() {
		Game.#setLevel(Game.level+1)
		State.setReady()
	}
	#onReady() {
		State.setInGame({delay:2200})
	}
	#onRoundEnds() {
		MazeMgr.dotsLeft == 0
			? State.setCleared()
			: State.setPacDying({delay:600})
	}
	#onPacDying() {
		Sound.playPacDying()
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
		Wall.setFlashing(Game.#onLevelEnds)
	}
	#onLevelEnds() {
		Game.#pacDied = false
		!Ctrl.endlessMode
			? State.setTitle()
			: Demo.CoffBreakNum < 0
				? State.setNewLevel()
				: State.setCoffBreak()
	}
	#onGameOver() {
		State.setTitle({delay:2000})
	}
	#update() {
		PtsMgr.update()
		FruitMgr.update()
		MazeMgr.PowDots.update()
		Demo.update()
		Actors.update()
	}
	#draw() {
		Fg.clear()
		State.isDemoMode
			? Demo.draw()
			: Game.#drawMain()
		Message.draw()
	}
	#drawMain() {
		ScoreMgr.draw()
		MazeMgr.PowDots.draw()
		FruitMgr.drawTarget()
		Actors.draw(player)
	}
}, Level = $('#level-num')
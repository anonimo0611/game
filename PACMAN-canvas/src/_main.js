import {Cursor} from '../_lib/mouse.js'
import {Sound}  from '../_snd/sound.js'
import  Speed   from './speed.js'
import {Menu}   from './ui.js'
import {State}  from './state.js'
import {Lives}  from './lives.js'
import {Cfg}    from './control.js'
import {Wall}   from './sprites/wall.js'
import {Maze}   from './maze.js'
import {player} from './player/player.js'
import {Scene}  from './scenes/scene.js'

export const Game = new class GameCore {
	static {$(this.setup)}
	static setup() {
		Ticker.set(Scene.update, Scene.draw)
		Menu.Level.onChange(Game.#resetLevel)
		State.on({
			Quit: ()=> State.setTitle(),
			NewGame:   Game.#onNewGame,
			NewLevel:  Game.#onNewLevel,
			Ready:     Game.#onReady,
			RoundEnds: Game.#onRoundEnd,
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

	/** Levels 1-13 scale in difficulty. Level 13 is the max difficulty cap. */
	get speedByLv() {return 1 - (13 - Game.clampedLv) * Speed.StepPerLevel}
	get clampedLv() {return clamp(Game.level, 1, 13)}
	get speed()     {return State.isInGame? Cfg.speed : 1}
	get interval()  {return Game.speed * Ticker.Interval}
	get moveSpeed() {return Game.speed * Game.speedByLv}

	#setLevel(n=1) {
		const lv = (Game.#level = between(n, 1, 0xFF) && n || 1)
		Level.val( String(lv).padStart(2,'0') ).trigger('change')
	}
	#reset() {
		Ticker.reset()
		Sound.stop()
		Cursor.show()
		Game.#resetLevel()
	}
	#resetLevel() {
		Game.#started = false
		Game.#pacDied = false
		Game.#setLevel(Menu.Level.index+1)
	}
	#onNewGame() {
		Game.#started = true
		Cursor.hide()
		Sound.playStartMusic()
		State.setReady({delay:2200})
	}
	#onNewLevel() {
		Game.#setLevel(Game.level+1)
		State.setReady()
	}
	#onReady() {
		State.setInGame({delay:2200})
	}
	#onRoundEnd() {
		Maze.dotsLeft <= Maze.CLEAR_DOTS
			? State.setCleared()
			: State.setPacDying({delay:600})
	}
	#onCleared() {
		Sound.stopLoops()
		State.setFlashing({delay:1000})
	}
	#onFlashing() {
		Wall.setFlashing(Game.#onLevelEnd)
	}
	#onLevelEnd() {
		Game.#pacDied = false
		Cfg.currentOnly
			? State.setTitle()
			: Scene.shouldPlayCutscene
				? State.setCutscene()
				: State.setNewLevel()
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
	#onGameOver() {
		State.setTitle({delay:2000})
	}
}, Level = $('#level-num')
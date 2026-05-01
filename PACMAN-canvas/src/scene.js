export {Scene}
import {WinState} from './ui.js'
import {Ctrl}     from './control.js'
import {States}   from './state.js'
import {State}    from './state.js'
import {Maze}     from './maze.js'
import {Fruit}    from './fruit.js'
import {Score}    from './score.js'
import {Actors}   from './actor.js'
import {player}   from './player/player.js'
import {PtsMgr}   from './points.js'
import {Message}  from './message.js'
import {Attract}  from './demo/attract.js'
import {Cutscene} from './demo/cutscene.js'

{// Reset counter on any title screen interaction
	const AnyEvt = `blur focus resize scroll keydown pointerdown mousemove wheel`
	State.onChange(()=> {
		$win.onNS('.ResetDemoTimer', {[AnyEvt]:Ticker.resetCount}, State.isTitle)
	})
}

/** @type {SceneDict<States[number]>} */
const Scenes = {Attract,Cutscene}
const DemoScene = {
	/** Attract mode will begin after a period of inactivity. */
	updateTimer() {
		if (State.isTitle) {
			!WinState.isActive || Ctrl.isCaptured
			? Ticker.resetCount()
			: Ticker.elapsedTime > 1e3*30 // 30secs
				&& State.setAttract()
		}
	},
	draw()   {Scenes[State.current]?.draw?.()},
	update() {Scenes[State.current]?.update()},
}

const MainScene = {
	update() {
		Fruit.update()
		Maze.PowDots.update()
		Actors.update(player)
	},
	draw() {
		Score.draw()
		Maze.PowDots.draw()
		Fruit.drawTarget()
		Actors.draw(player)
	},
}

const Scene = new class SceneManager {
	get shouldPlayCutscene() {
		return Cutscene.num > 0
	}
	get #current() {
		return State.isDemoMode? DemoScene:MainScene
	}
	update() {
		PtsMgr.update()
		DemoScene.updateTimer()
		Scene.#current.update()
	}
	draw() {
		Fg.clear()
		Scene.#current.draw()
		Message.draw()
	}
}

$('button.demo').each((i,button)=> {
	const startScene = (i == 0)
		? ()=> State.setAttract()
		: ()=> State.setCutscene({data:i})
	$(button).on({click:startScene})
})
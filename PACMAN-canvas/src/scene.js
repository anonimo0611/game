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
export {Scene}

{// Reset counter on any title screen interaction
	const EV = `blur focus resize scroll keydown pointerdown mousemove wheel`
	State.onChange(()=> {
		const handlers = {[EV]:Ticker.resetCount}
		$win.onNS('ResetDemoTimer', handlers, State.isTitle)
	})
}

/** @type {SceneDict<States[number]>} */
const DemoDict  = {Attract,Cutscene}
const DemoScene = {
	/** Attract mode will begin after a period of inactivity. */
	updateTimer() {
		const waitIime = 1e3*30 // 30secs
		if (State.isTitle) {
			!WinState.isActive || Ctrl.isCaptured
			? Ticker.resetCount()
			: Ticker.elapsedTime > waitIime && State.setAttract()
		}
	},
	update() {
		DemoDict[State.current]?.update()
	},
	draw() {
		DemoDict[State.current]?.draw?.()
	},
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

const Scenes = [MainScene,DemoScene]
const Scene  = new class SceneManager {
	get shouldPlayCutscene() {
		return Cutscene.num > 0
	}
	update() {
		PtsMgr.update()
		DemoScene.updateTimer()
		Scenes[+State.isDemoMode].update()
	}
	draw() {
		Fg.clear()
		Scenes[+State.isDemoMode].draw()
		Message.draw()
	}
}

$('button.demo').each((i,button)=> {
	const startScene = (i == 0)
		? ()=> State.setAttract()
		: ()=> State.setCutscene({data:i})
	$(button).on({click:startScene})
})
import {WinState} from '../ui.js'
import {Ctrl}     from '../control.js'
import {State}    from '../state.js'
import {Attract}  from '../demo/attract.js'
import {Cutscene} from '../demo/cutscene.js'

{// Reset counter on any title screen interaction
	const EV = `blur focus resize scroll keydown pointerdown mousemove wheel`
	State.onChange(()=> {
		const handlers = {[EV]:Ticker.resetCount}
		$win.onNS('ResetDemoTimer', handlers, State.isTitle)
	})
}

$('button.demo').each((i,button)=> {
	const startScene = (i == 0)
		? ()=> State.setAttract()
		: ()=> State.setCutscene({data:i})
	$(button).on({click:startScene})
})

/**@type {SceneDict<string>}*/
const DemoDict = {Attract,Cutscene}

export const DemoScene = {
	get shouldPlayCutscene() {
		return Cutscene.num > 0
	},
	update() {
		DemoDict[State.current]?.update()
	},
	draw() {
		DemoDict[State.current]?.draw()
	},
	/** Attract mode will begin after a period of inactivity. */
	updateTimer() {
		const waitIime = 1e3*30 // 30secs
		if (State.isTitle) {
			!WinState.isActive || Ctrl.isCaptured
			? Ticker.resetCount()
			: Ticker.elapsedTime > waitIime && State.setAttract()
		}
	},
}
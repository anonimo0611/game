import {WinState} from '../ui.js'
import {Ctrl}     from '../control.js'
import {State}    from '../state.js'
import {Attract}  from '../demo/attract.js'
import {Cutscene} from '../demo/cutscene.js'
export {DemoScene}

{// Reset counter on any title screen interaction
	const EV = `blur focus resize scroll keydown pointerdown mousemove wheel`
	State.onChange(()=> {
		const handlers = {[EV]:Ticker.resetCount}
		$win.onNS('ResetDemoTimer', handlers, State.isTitle)
	})
}

/** @type {SceneDict<string>} */
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
	draw()   {DemoDict[State.current]?.draw()},
	update() {DemoDict[State.current]?.update()},
}

$('button.demo').each((i,button)=> {
	const startScene = (i == 0)
		? ()=> State.setAttract()
		: ()=> State.setCutscene({data:i})
	$(button).on({click:startScene})
})
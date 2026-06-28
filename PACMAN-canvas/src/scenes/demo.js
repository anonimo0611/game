import {Env}      from '../control.js'
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
		if (!State.isTitle) return
		!Env.window.isActive || Env.isCaptured
			? Ticker.resetCount()
			: Ticker.elapsedTime > 1e3*30 // 30secs
				&& State.setAttract()
	},
	draw()   {DemoDict[State.current]?.draw()},
	update() {DemoDict[State.current]?.update()},
}

$('button.demo.at').on({click:State.setAttract})
$('button.demo.cs').each((i,btn)=> {
	$(btn).on({click(){State.setCutscene({data:i+1})}})
})
import {Env}      from '../env.js'
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
$('#cfgPanelBtns')
.on('click','button.demo.at', State.setAttract)
.on('click','button.demo.cs', function() {
    State.setCutscene({data:+$(this).data('n')});
})

/** @type {SceneDict<string>} */
const SceneDict = {Attract,Cutscene}

/** Attract mode will begin after a period of inactivity. */
export const updateTimer = ()=> {
	if (!State.isTitle) return
	(!Env.window.isActive || Env.isCaptured)
		? Ticker.resetCount()
		: Ticker.elapsedTime > 1e3*30 // 30secs
			&& State.setAttract()
}
export const Scene = {
	draw()   {SceneDict[State.current]?.draw()},
	update() {SceneDict[State.current]?.update()},
}
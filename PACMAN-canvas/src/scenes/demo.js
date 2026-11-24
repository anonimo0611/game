import {Env}      from '@/env.js'
import {State}    from '@/state.js'
import {Attract}  from './attract.js'
import {Cutscene} from './cutscene.js'

{// Reset counter on any title screen interaction
	const EV = `blur focus resize scroll keydown pointerdown mousemove wheel`
	State.onChange(()=> {
		const handlers = {[EV]:Ticker.resetCount}
		$win.onNS('ResetDemoTimer', handlers, State.isTitle)
	})
}

/** @type {SceneDict} */
const SceneDict = {Attract,Cutscene}

/** @param {JQEvent<HTMLButtonElement>} e */
const onCutsceneBtnClick =
	e=> State.setCutscene({data:+e.target.value})

$('button.at').on({click:State.setAttract})
$('button.cs').on({click:onCutsceneBtnClick})

/** Attract mode will begin after a period of inactivity. */
export const updateTimer = ()=> {
	if (!State.isTitle) return
	(!Env.window.isActive || Env.isCaptured)
		? Ticker.resetCount()
		: Ticker.elapsedTime > 1e3*30 && State.setAttract()
}
export const Scene = {
	draw()   {SceneDict[State.current]?.draw()},
	update() {SceneDict[State.current]?.update()},
}
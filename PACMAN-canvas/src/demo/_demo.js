import {Ctrl}      from '../control.js'
import {State}     from '../state.js'
import {States}    from '../state.js'
import {WinState}  from '../ui.js'
import {demoBtns}  from '../ui.js'
import {Attract}   from './attract.js'
import {CoffBreak} from './coffee_break.js'

const Evt = 'blur_focus_pointerdown_mousemove_keydown_scroll_resize_wheel'
const WaitTime = 1e3*30 // 30secs

/** Attract Mode will begin after a period of inactivity. */
const RunTimer = function() {
	State.onChange(()=> {
		State.isTitle
			? $onNS('RunTimer', {[Evt]:Ticker.resetCount})
			: $off('.RunTimer')
	})
	function update() {
		(!WinState.isActive || Ctrl.isCaptured)
			? Ticker.resetCount()
		 	: Ticker.elapsedTime > WaitTime && State.setAttract()
	}
	return {update}
}()

range(demoBtns.length).forEach(i=> {
	const click = (i == 0)
		? ()=> State.setAttract()
		: ()=> State.setCoffBreak({data:i})
	$(demoBtns[i]).on({click})
})

/** @type {SceneDict<States[number]>} */
const Scenes = {Title:RunTimer,Attract,CoffBreak}

export const Demo = {
	get CoffBreakNum() {return CoffBreak.num},
	draw()   {Scenes[State.current]?.draw?.()},
	update() {Scenes[State.current]?.update()},
}
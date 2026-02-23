import {Confirm}   from '../../_lib/confirm.js'
import {Ctrl}      from '../control.js'
import {State}     from '../state.js'
import {Attract}   from './attract.js'
import {CoffBreak} from './coffee_break.js'
export {Demo}

const Evt = 'blur_focus_pointerdown_mousemove_keydown_scroll_resize_wheel'
const WaitTime = 1e3*30 // 30secs

/** Attract Mode will begin after a period of inactivity. */
const RunTimer = function() {
	let active = true
	State.onChange(()=> {
		State.isTitle
			? $onNS('RunTimer', {[Evt]:Ticker.resetCount})
			: $off('.RunTimer')
	})
	function update() {
		(!active || Confirm.opened || Ctrl.activeElem)
			? Ticker.resetCount()
		 	: Ticker.elapsedTime > WaitTime && State.setAttract()
	}
	$win.on({blur: ()=> active = false})
	$win.on({focus:()=> active = true })
	return {update}
}()

/** @type {{[K in import('../state').StateType]?:Scene}} */
const Scenes = {Title:RunTimer,Attract,CoffBreak}
const Demo = {
	get CoffBreakNum() {return CoffBreak.num},
	draw()   {Scenes[State.current]?.draw?.()},
	update() {Scenes[State.current]?.update()},
}
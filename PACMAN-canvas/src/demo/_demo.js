import {Confirm}   from '../../_lib/confirm.js'
import {Ctrl}      from '../control.js'
import {State}     from '../state.js'
import {Attract}   from './attract.js'
import {CoffBreak} from './coffee_break.js'

const Events = 'blur_focus_pointerdown_mousemove_keydown_scroll_resize_wheel'
const WaitTime = 1e3*30 // 30secs

/** Attract Mode will begin after a period of inactivity. */
const RunTimer = function() {
	State.onChange(()=> {
		State.isTitle == false
			? $off('.RunTimer')
			: $onNS('RunTimer', {[Events]:Ticker.resetCount})
	})
	function update() {
		(!document.hasFocus() || Confirm.opened || Ctrl.activeElem)
			? Ticker.resetCount()
		 	: Ticker.elapsedTime > WaitTime && State.setAttract()
	}
	return {update}
}()

/** @type {{[K in import('../state').StateType]?:Scene}} */
const Scenes = {Title:RunTimer,Attract,CoffBreak}
export const Demo = {
	get CoffBreakNum() {return CoffBreak.num},
	draw()   {Scenes[State.current]?.draw?.()},
	update() {Scenes[State.current]?.update()},
}
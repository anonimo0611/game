// The attract demo begins after 30 seconds of inactivity
const WaitTime  = 1e3*30 // ms

import {Confirm} from '../../_lib/confirm.js'
import {State}   from '../state.js'
export const RunTimer = function() {
	let fcnt = 0
	function update() {
		(!document.hasFocus()
			|| !State.isTitle
			|| Confirm.opened
			|| qS(':not(#startBtn):focus')
		)? fcnt = 0
		 : fcnt++ * Ticker.Interval > WaitTime
			&& $(RunTimer).trigger('begin')
	}
	return {update,reset:()=>{fcnt=0}}
}()
$win.on('Title blur click focus mousemove keydown resize wheel',RunTimer.reset)
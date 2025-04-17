// The attract demo begins after 30 seconds of inactivity
const WaitTime  = 1e3*30 // ms

import {Confirm} from '../../_lib/confirm.js'
export const RunTimer = function() {
	let fcnt = 0
	function update() {
		(!document.hasFocus()
			|| Confirm.opened
			|| dqs(':not(#startBtn):focus')
		)? fcnt = 0
		 : fcnt++ * Ticker.Interval > WaitTime
			&& $(RunTimer).trigger('Run')
	}
	return {update,reset:()=>{fcnt=0}}
}()
$on({Title_blur_click_focus_mousemove_keydown_resize_wheel:RunTimer.reset})
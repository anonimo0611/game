// The attract demo begins after 30 seconds of inactivity
const WaitTime = 1e3*30 // ms
let  _frameCnt = 0

$on({Title_blur_click_focus_mousemove_keydown_resize_wheel:()=> _frameCnt=0})

import {Confirm} from '../../_lib/confirm.js'
export const RunTimer = new class {
	update() {
		(!document.hasFocus()
			|| Confirm.opened
			|| dqs(':not(#startBtn):focus')
		)? _frameCnt = 0
		 : _frameCnt++ * Ticker.Interval > WaitTime
			&& $(RunTimer).trigger('Run')
	}
}
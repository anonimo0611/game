import {Ticker}  from '../../_lib/timer.js'
import {Confirm} from '../../_lib/confirm.js'

let _frameCnt = 0

// The attract demo begins after 30 seconds of inactivity
const WaitTime = 1e3 * 30 // ms
$on('Title blur click focus mousemove keydown resize wheel',
	()=> _frameCnt = 0)

export const AttractTimer = new class {
	update() {
		(!document.hasFocus()
		 || Confirm.opened
		 || dqs(':not(#startBtn):focus')
		) ? _frameCnt = 0
		  : _frameCnt++ * Ticker.Interval > WaitTime
			&& $(AttractTimer).trigger('Run')
	}
}
// The attract demo begins after 30 seconds of inactivity
const  WaitTime = 1e3*30 // ms
import {Confirm} from '../../_lib/confirm.js'
import {Ctrl}    from '../control.js'
import {State}   from '../state.js'
export const RunTimer = function() {
	let fcnt = 0
	function update() {
		(!document.hasFocus()
			|| !State.isTitle
			|| Confirm.opened
			|| Ctrl.activeElem
		)? (fcnt=0)
		 : (fcnt++)*Ticker.Interval > WaitTime
		 	&& State.to('Attract')
	}
	$win.on(`Title blur click focus
		mousemove keydown resize wheel`,()=>{fcnt=0})
	return {update}
}()
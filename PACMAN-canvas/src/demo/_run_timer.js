import {Confirm} from '../../_lib/confirm.js'
import {Ctrl}    from '../control.js'
import {State}   from '../state.js'

/** The attract demo begins after 30 seconds of inactivity */
const WaitTime = 1e3*30 // ms

export const RunTimer = function() {
	let _cnt=0
	function update() {
		(!document.hasFocus()
		  || !State.isTitle
		  || Confirm.opened
		  || Ctrl.activeElem)
		? _cnt=0
		: _cnt++ * Ticker.Interval > WaitTime
			&& State.toAttract()
	}
	$win.on(`Title blur click focus mousemove keydown resize wheel`, ()=> _cnt=0)
	return {update}
}()
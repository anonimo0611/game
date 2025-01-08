import {Ticker}  from '../_lib/timer.js'
import StateBase from '../_lib/state.js'
export const State = new class extends StateBase {
	isTitle     = true
	isAttract   = false
	isStart     = false
	isRestart   = false
	isNewLevel  = false
	isReady     = false
	isPlaying   = false
	isClear     = false
	isFlashMaze = false
	isLosing    = false
	isGameOver  = false
	isCBreak    = false
	isQuit      = false
	constructor() {
		super()
		this.init()
	}
	#callback(state) {
		Ticker.resetCount()
		;/Restart|NewLevel/.test(state) && $trigger('Respawn')
		$trigger(document.body.dataset.state = state)
	}
	switchTo(state, delay=(state=='Quit') ? -1:0) {
		return super.switchTo(state, {delay,fn:this.#callback})
	}
}
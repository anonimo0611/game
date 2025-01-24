import {Ticker}  from '../_lib/timer.js'
import BaseState from '../_lib/state.js'
export const State = new class extends BaseState {
	isTitle     = true
	isAttract   = false
	isStart     = false
	isRestart   = false
	isNewLevel  = false
	isReady     = false
	isPlaying   = false
	isClear     = false
	isFlashMaze = false
	isCollided  = false
	isLosing    = false
	isGameOver  = false
	isCBreak    = false
	isQuit      = false
	constructor() {
		super()
		this.init()
	}
	get isSt_Ready() {
		return this.isStart || this.isReady
	}
	#callback(state, data) {
		Ticker.resetCount()
		$trigger(document.body.dataset.state=state, data)
	}
	switchTo(state, {delay=(state=='Quit' ? -1:0),data}={}) {
		return super.switchTo(state, {delay,data,fn:this.#callback})
	}
}
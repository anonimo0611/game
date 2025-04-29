import _State      from '../_lib/state.js'
import {StateType} from './state_type.js'
export const State = new class extends _State {
	isTitle     = true
	isAttract   = false
	isStart     = false
	isRestart   = false
	isNewLevel  = false
	isReady     = false
	isPlaying   = false
	isClear     = false
	isFlashMaze = false
	isCoffBrk   = false
	isCrashed   = false
	isLosing    = false
	isGameOver  = false
	isQuit      = false
	constructor() {
		super()
		this.init()
	}
	/** @returns {keyof StateType} */
	get current()    {return super.current}
	get isSt_Ready() {return this.isStart || this.isReady}

	/** @param {keyof StateType} state */
	last(state) {
		return super.last(state)
	}
	/** @param {keyof StateType} state */
	to(state, {delay=(state=='Quit' ? -1:0),data}={}) {
		return super.to(state, {delay,data,fn:this.#callback})
	}
	/** @param {keyof StateType} state */
	#callback(state, data) {
		Ticker.resetCount()
		$trigger(document.body.dataset.state=state, data)
	}
}

/**
 * @typedef {'Title'|'Attract'|'Start'|'Restart'|'NewLevel'|'Ready'|'Playing'|
 * 'Clear'|'FlashMaze'|'CoffBrk'|'Crashed'|'Losing'|'GameOver'|'Quit'} StateType
 */
import _State from '../_lib/state.js'
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
	get isSt_Ready() {
		return this.isStart || this.isReady
	}
	get current() {
		return /**@type {StateType}*/(super.current)
	}
	/** @param {StateType} [state] */
	last(state) {
		return /**@type {StateType|''}*/(super.last(state))
	}

	/**
	 * @param {StateType} state
	 * @param {unknown} data
	 */
	#callback(state, data) {
		Ticker.resetCount()
		$trigger(dBody.dataset.state=state, data)
	}
	/**
	 * @param {StateType} state
	 * @param {{delay?:number,data?:unknown}} config
	 */
	to(state, {delay=(state=='Quit' ? -1:0),data}={}) {
		return super.to(state, {delay,data,fn:this.#callback})
	}
}
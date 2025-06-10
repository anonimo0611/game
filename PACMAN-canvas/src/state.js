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

	constructor() {super(),this.init()}

	/** @param {StateType} [s] */
	last(s)          {return /**@type {StateType}*/(super.last(s))}
	get current()    {return /**@type {StateType}*/(super.current)}
	get isSt_Ready() {return this.isStart || this.isReady}

	/**
	 * @param {StateType} s
	 * @param {unknown} data
	 */
	#callback(s, data) {
		Ticker.resetCount()
		$trigger(dBody.dataset.state=s, data)
	}

	/**
	 * @param {StateType} s
	 * @param {{delay?:number,data?:unknown}} config
	 */
	to(s, {delay=(s == 'Quit' ? -1:0),data}={}) {
		return super.to(s, {delay,data,fn:this.#callback})
	}
}
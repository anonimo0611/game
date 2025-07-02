/**
 * @typedef {(
 * 'Title'|'Attract'|'Start'|'Restart'|'NewLevel'|'Ready'|'Playing'|
 * 'Clear'|'FlashMaze'|'CoffBrk'|'Crashed'|'Dying'|'GameOver'|'Quit'|
 * '_Ready'|'_NewLevel'|'_Restart_NewLevel'|'_Start_Ready_Restart'|'_Clear_Crashed'
 * )} StateType
 */
import _State from '../_lib/state.js'
export const State = new class extends _State {
	isTitle     = false
	isAttract   = false
	isStart     = false
	isReady     = false
	isPlaying   = false
	isRestart   = false
	isNewLevel  = false
	isClear     = false
	isFlashMaze = false
	isCoffBrk   = false
	isCrashed   = false
	isDying     = false
	isGameOver  = false
	isQuit      = false

	constructor() {super(),this.init()}

	/** @param {StateType} [s] */
	last(s)          {return /**@type {StateType}*/(super.last(s))}
	get current()    {return /**@type {StateType}*/(super.current)}
	get isSt_Ready() {return this.isStart || this.isReady}

	/**
	 * @param {StateType} s
	 * @param {any[]|JQuery.PlainObject|string|number|boolean} data
	 */
	#callback(s, data) {
		Ticker.resetCount()
		$win.trigger(dBody.dataset.state=s, data)
	}

	/**
	 * @param {StateType|{[key in StateType]?:JQWindowHandler}} v
	 * @param {JQWindowHandler} [fn]
	 * @type {((state:{[key in StateType]?:JQWindowHandler})=> State)
	 *      & ((state:StateType,fn:JQWindowHandler)=> State)}
	 */
	on = (v, fn)=> {
		typeof(v)  == 'string' &&
		typeof(fn) == 'function'
			? $win.on({[_toSp(v,this.default)]:fn})
			: entries(v).forEach(([ev,fn])=> $win.on({[_toSp(ev,this.default)]:fn}))
		return this
	}

	/**
	 * @param {StateType} s
	 * @param {{delay?:number,data?:unknown}} config
	 */
	to(s, {delay=(s == 'Quit' ? -1:0),data}={}) {
		return super.to(s, {delay,data,fn:this.#callback})
	}
}
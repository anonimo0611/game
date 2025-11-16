import _State from '../_lib/state.js'
/**
@typedef {
  'Title'|'Attract'|'Start'|'Restart'|'NewLevel'|'Ready'|'Playing'|
  'Clear'|'FlashMaze'|'CoffBrk'|'Crashed'|'Dying'|'GameOver'|'Quit'
} StateType
@typedef {
  '_Ready'|'_NewLevel'|'_Restart_NewLevel'|
  '_Start_Ready_Restart'|'_Clear_Crashed'
} MultiState
*/

/** @extends {_State<globalThis,StateType>} */
class GameState extends _State {
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
	constructor() {super(globalThis),this.init()}

	/**
	 @param {StateType} s
	 @param {number|string|boolean|any[]} [data]
	*/
	#callback(s, data) {
		Ticker.resetCount()
		$win.trigger(dBody.dataset.state=s, data)
	}

	/**
	 @param {{[key in (StateType|MultiState)]?:JQWindowHandler}} v
	*/
	on(v) {return super.on(v)}

	/**
	 @param {StateType} s
	 @param {{delay?:number,data?:unknown}} config
	*/
	to(s, {delay=(s == 'Quit' ? -1:0),data}={}) {
		return super.to(s, {delay,data,fn:this.#callback})
	}
} export const State = freeze(new GameState)
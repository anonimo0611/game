import StateBase from '../_lib/state.js'

/** @typedef {import('../_lib/_state.d').StateDef.Opts} Opts */
/** @typedef {typeof States[number]} StateType */
const States = /**@type {const}*/([
	'Title','Attract','Intro','Ready','InGame','NewLevel','Cleared',
	'Flashing','CoffBreak','PacCaught','PacDying','GameOver','Quit'])

/** @extends {StateBase<GameState,globalThis,StateType>} */
class GameState extends StateBase {
	constructor() {super(globalThis), this.init(States)}
	get isDemoMode()  {return this.isAttract || this.isCoffBreak}
	get isStartMode() {return this.isIntro   || this.isReady}

	/**
	 @param {StateType} s
	 @param {JQData} [data]
	*/
	#callback(s, data) {
		Ticker.resetCount()
		$win.trigger(document.body.dataset.state=s, data)
	}

	/**
	 @typedef {'_Ready'|'_NewLevel'|'_PacDying_Cleared'} MultiState
	 @param {{[key in (StateType|MultiState)]?:JQWindowHandler}} v
	*/
	on(v) {return super.on(v)}

	/**
	 @param {StateType} s
	 @param {Opts} options
	*/
	to(s, {data,delay=(s == 'Quit' ? -1 : 0)}={}) {
		return super.to(s, {data,delay,fn:this.#callback})
	}
}
export const State = new GameState
import _State from '../_lib/state.js'

/** @typedef {typeof States[number]} StateType */
const States = /**@type {const}*/([
	'Title','Attract','Intro','Ready','InGame','NewLevel','RoundEnds',
	'Cleared','PacDying','Flashing','CoffBreak','GameOver','Quit'])
/**
 @extends {_State<globalThis,StateType>}
 @typedef {GameState & StateDef.Props<globalThis,StateType>} IState
*/
class GameState extends _State {
	constructor() {super(globalThis), this.init(States)}
	get isDemoMode()  {return State.isAttract || State.isCoffBreak}
	get isStartMode() {return State.isIntro   || State.isReady}

	/**
	 @param {StateType} s
	 @param {JQData} [data]
	*/
	#callback(s, data) {
		Ticker.resetCount()
		$win.trigger(document.body.dataset.state=s, data)
	}

	/**
	 @typedef {'_Ready'|'_NewLevel'} MultiState
	 @param {{[key in (StateType|MultiState)]?:JQWindowHandler}} v
	*/
	on(v) {return super.on(v)}

	/**
	 @param {StateType} s
	 @param {StateDef.Opts<StateType>} options
	*/
	to(s, {data,delay=(s == 'Quit' ? -1 : 0)}={}) {
		return super.to(s, {data,delay,fn:this.#callback})
	}
}
export const State = /**@type {IState}*/(new GameState)
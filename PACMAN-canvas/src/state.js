import _State from '../_lib/state.js'

/**
 @typedef {typeof States[number]} StateType
 @typedef {`_${Exclude<StateType,'Title'>}`} Underscored
*/
export const States = /**@type {const}*/([
	'Title','Attract','NewGame','Ready','InGame','NewLevel','RoundEnds',
	'Cleared','PacDying','Flashing','CoffBreak','GameOver','Quit'])
/**
 @extends {_State<StateType,globalThis>}
 @typedef {GameState & StateDef.Props<StateType>} IGameState
*/
class GameState extends _State {
	constructor() {super(globalThis, States)}
	get isStartMode() {return State.isNewGame || State.isReady}
	get isDemoMode()  {return State.isAttract || State.isCoffBreak}

	/**
	 @param {StateType} s
	 @param {JQData} [data]
	*/
	callback(s, data) {
		Ticker.resetCount()
		$win.trigger(document.body.dataset.state = s, data)
	}

	/**
	 @param {{[key in (StateType|Underscored)]?:JQWindowHandler}} o
	*/
	on(o) {return super.on(o)}

	/**
	 @param {StateType} s
	 @param {StateDef.Opts<StateType>} options
	*/
	set(s, {data,delay=(/Title|Quit/.test(s) ? -1 : 0)}={}) {
		return super.set(s, {data,delay})
	}
}
export const State = /**@type {IGameState}*/(new GameState)
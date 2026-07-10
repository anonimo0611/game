import {AState} from '../_lib/state.js'

/** @typedef {typeof States[number]} StateType */
const States = /**@type {const}*/([
	'Title','Attract','NewGame','NewLevel','Ready','InGame','RoundEnds',
	'Cleared','PacDying','Flashing','Cutscene','GameOver','Quit'
])

/**
 @extends {AState<StateType,States,globalThis>}
 @typedef {StateDef.Fluent<GameState,StateType>} IGameState
*/
class GameState extends AState {
	constructor() {super(globalThis, States)}
	get isStarting() {return State.isNewGame || State.isReady}
	get isDemoMode() {return State.isAttract || State.isCutscene}

	/**
	 @protected
	 @param {StateType} s
	 @param {JQData} [data]
	*/
	callback(s, data) {
		Ticker.resetCount()
		Timer.cancelAll()
		$win.trigger(document.body.dataset.state = s, data)
	}

	/**
	 @param {StateType} s
	 @param {StateDef.Opts<StateType>} options
	*/
	set(s, {data,delay=(/Title|Quit/.test(s) ? -1 : 0)}={}) {
		return super.set(s, {data,delay})
	}
}
export const State = /**@type {IGameState}*/(new GameState)
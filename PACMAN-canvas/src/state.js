import StateBase from '../_lib/state.js'
/**
 @typedef {typeof States[number]} StateType
 @typedef {'_Ready'|'_NewLevel'|'_Restarted_NewLevel'|'_PacDying_Cleared'} MultiState
*/const States = /**@type {const}*/(['Title','Attract','Intro','Ready','InGame','Restarted',
	'NewLevel','Cleared','Flashing','CoffBreak','PacCaught','PacDying','GameOver','Quit'])

/**
 @extends {StateBase<globalThis,StateType>}
 @typedef {{[K in StateType as `is${K}`]:boolean}} Is
 @typedef {{[K in StateType as`was${K}`]:boolean}} Was
 @typedef {{[K in StateType as `to${K}`]:(opt?:StateOptions)=> IGameState}} To
 @typedef {GameState & Is & Was & To} IGameState
*/
class GameState extends StateBase {
	constructor() {super(globalThis),this.init(States)}
	get isStartMode() {return this.is('Intro')   || this.is('Ready')}
	get isDemoScene() {return this.is('Attract') || this.is('CoffBreak')}

	/**
	 @param {StateType} s
	 @param {JQData} [data]
	*/
	#callback(s, data) {
		Ticker.resetCount()
		$win.trigger(document.body.dataset.state=s, data)
	}

	/**
	 @param {{[key in (StateType|MultiState)]?:JQWindowHandler}} v
	*/
	on(v) {return super.on(v)}

	/**
	 @param {StateType} s
	 @param {{delay?:number,data?:JQData}} options
	*/
	to(s, {delay=(s == 'Quit' ? -1 : 0),data}={}) {
		return super.to(s, {delay,data,fn:this.#callback})
	}
}
export const State = /**@type {Readonly<IGameState>}*/(freeze(new GameState))
import _State from '../_lib/state.js'
/**
@typedef {
  'Title'|'Attract'|'Starting'|'Restarted'|'NewLevel'|'Ready'|'Playing'|
  'Cleared'|'Flashing'|'CoffBreak'|'PacCaught'|'PacDying'|'GameOver'|'Quit'
} StateType
@typedef {
  '_Ready'|'_NewLevel'|'_Restarted_NewLevel'|
  '_Starting_Ready_Restarted'|'_PacDying_Cleared'
} MultiState
*/

/** @extends {_State<globalThis,StateType>} */
class GameState extends _State {
	isTitle     = false
	isAttract   = false
	isStarting  = false
	isReady     = false
	isPlaying   = false
	isRestarted = false
	isNewLevel  = false
	isCleared   = false
	isFlashing  = false
	isCoffBreak = false
	isPacCaught = false
	isPacDying  = false
	isGameOver  = false
	isQuit      = false
	constructor() {super(globalThis),this.init()}

	get toTitle()     {return this.ret('Title')}
	get toAttract()   {return this.ret('Attract')}
	get toStart()     {return this.ret('Starting')}
	get toReady()     {return this.ret('Ready')}
	get toPlaying()   {return this.ret('Playing')}
	get toRestart()   {return this.ret('Restarted')}
	get toNewLevel()  {return this.ret('NewLevel')}
	get toCleared()   {return this.ret('Cleared')}
	get toFlashing()  {return this.ret('Flashing')}
	get toCoffBreak() {return this.ret('CoffBreak')}
	get toPacCaught() {return this.ret('PacCaught')}
	get toPacDying()  {return this.ret('PacDying')}
	get toGameOver()  {return this.ret('GameOver')}
	get toQuit()      {return this.ret('Quit')}

	get wasTitle()    {return !!this.last('Title')}
	get wasStart()    {return !!this.last('Starting')}
	get wasFlashing() {return !!this.last('Flashing')}

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
	set(s, {delay=(s == 'Quit' ? -1:0),data}={}) {
		return super.set(s, {delay,data,fn:this.#callback})
	}
} export const State = freeze(new GameState)
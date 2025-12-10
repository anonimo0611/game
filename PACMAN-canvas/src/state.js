import _State from '../_lib/state.js'
/**
@typedef {
  'Title'|'Attract'|'Intro'|'Restarted'|'NewLevel'|'Ready'|'InGame'|
  'Cleared'|'Flashing'|'CoffBreak'|'PacCaught'|'PacDying'|'GameOver'|'Quit'
} StateType
@typedef {
  '_Ready'|'_NewLevel'|'_Restarted_NewLevel'|
  '_Intro_Ready_Restarted'|'_PacDying_Cleared'
} MultiState
*/

/** @extends {_State<globalThis,StateType>} */
class GameState extends _State {
	isTitle     = false
	isAttract   = false
	isIntro     = false
	isReady     = false
	isInGame    = false
	isRestarted = false
	isNewLevel  = false
	isCleared   = false
	isFlashing  = false
	isCoffBreak = false
	isPacCaught = false
	isPacDying  = false
	isGameOver  = false
	isQuit      = false

	get toTitle()     {return this.ret('Title')}
	get toAttract()   {return this.ret('Attract')}
	get toIntro()     {return this.ret('Intro')}
	get toReady()     {return this.ret('Ready')}
	get toInGame()    {return this.ret('InGame')}
	get toRestart()   {return this.ret('Restarted')}
	get toNewLevel()  {return this.ret('NewLevel')}
	get toCleared()   {return this.ret('Cleared')}
	get toFlashing()  {return this.ret('Flashing')}
	get toCoffBreak() {return this.ret('CoffBreak')}
	get toPacCaught() {return this.ret('PacCaught')}
	get toPacDying()  {return this.ret('PacDying')}
	get toGameOver()  {return this.ret('GameOver')}
	get toQuit()      {return this.ret('Quit')}

	get wasTitle()    {return this.was('Title')}
	get wasIntro()    {return this.was('Intro')}
	get wasFlashing() {return this.was('Flashing')}
	get isStartMode() {return this.isIntro || this.isReady}

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
	set(s, {delay=(s == 'Quit' ? -1:0),data}={}) {
		return super.set(s, {delay,data,fn:this.#callback})
	}
} export const State = freeze(new GameState)
import _State from '../_lib/state.js'
/**
@typedef {
  'Title'|'Attract'|'Intro'|'Restarted'|'NewLevel'|'Ready'|'InGame'|
  'Cleared'|'Flashing'|'CoffBreak'|'PacCaught'|'PacDying'|'GameOver'|'Quit'
} StateType
@typedef {
  '_Ready'|'_NewLevel'|'_Restarted_NewLevel'|'_PacDying_Cleared'
} MultiState
*/

/**
 @extends {_State<globalThis,StateType>}
 @typedef {import('../_lib/state.js').Config} Config
 @typedef {import('../_lib/state.js').Data} Data
 @typedef {{[K in StateType as `to${K}`]:(cfg?:Config)=> IState}} Methods
 @typedef {GameState & Methods} IState
*/
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

	get wasTitle()    {return this.was('Title')}
	get wasIntro()    {return this.was('Intro')}
	get wasFlashing() {return this.was('Flashing')}
	get isStartMode() {return this.isIntro || this.isReady}
	get isDemoScene() {return this.isAttract || this.isCoffBreak}

	constructor() {super(globalThis),this.init(true)}

	/**
	 @param {StateType} s
	 @param {Data} [data]
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
	 @param {{delay?:number,data?:Data}} config
	*/
	set(s, {delay=-1,data}={}) {
		return super.set(s, {delay,data,fn:this.#callback})
	}
} export const State = /**@type {Readonly<IState>}*/(freeze(new GameState))
import {Sound}    from '../../_snd/sound.js'
import {Game}     from '../_main.js'
import {Ctrl,Cfg} from '../control.js'
import {State}    from '../state.js'
import {Score}    from '../score.js'
import {Maze}     from '../maze.js'
import  PacSpr    from '../sprites/pacman.js'
import {Mover}    from './controller.js'
import {TunEntry} from './tunnel.js'
import {Actor,Ghosts} from '../actors.js'

const EventBus = $({})
const EATEN_EV = 'DotEaten'

let fadePlayer = /**@type {?Fade}*/(null)

export class PacMan extends Actor {
	/** @readonly */
	sprite = new PacSpr(Fg,T)
	constructor(col=0, row=0) {
		super(col, row)
	}
	get hidden() {
		return Timer.frozen
	}
	update() {
		this.sprite.update(this)
	}
	draw() {
		this.sprite.draw(this)
	}
}

class Player extends PacMan {
	#wakaWakaSEIndex = 0
	#sinceLastEating = 0

	/** @type {Mover} */
	#mov      = new Mover()
	#tunEntry = new TunEntry()
	constructor() {super(13.5, 24)}

	get speed()    {return this.#mov.speed}
	get onWall()   {return this.#mov.onWall}
	get tunEntry() {return this.#tunEntry}
	get alpha()    {return fadePlayer?.alpha ?? this.maxAlpha}
	get maxAlpha() {return Ctrl.semiTransPac? .75:1}
	get closed()   {return State.isInGame == false}
	get timeSinceLastEating() {return this.#sinceLastEating}

	resetTimer() {
		this.#sinceLastEating = 0
	}
	forwardPos(n=0) {
		return Vec2[this.dir].mul(n*T).add(this.center)
	}
	offsetTarget(n=0) {
		const  ofstX = (this.dir == U ? -n : 0)
		return this.forwardPos(n).addX(ofstX*T)
	}
	draw() {
		if (State.isNewGame) return
		this.sprite.draw(this)
		this.drawCenterDot()
	}
	drawCenterDot() {
		if (!this.hidden && Cfg.showGridLines)
			super.drawCenterDot()
	}
	update() {
		this.sprite.update(this)
		fadePlayer?.update(this.maxAlpha)
		if (!this.closed && !this.hidden) {
			this.#tunEntry.update()
			this.#sinceLastEating += Game.interval
			this.#update(this.speed+.5|0)
		}
		if (!State.isInGame)
			this.keepInsideBoard()
	}
	#update(steps=1) {
		for (let i=0; i<steps; i++) {
			this.#eatDot(this.tileIdx)
			const spd = this.speed/steps
			if (this.#mov.update(spd)) break
		}
	}
	#eatDot(tileIdx=-1) {
		if (!Maze.hasDot(tileIdx))
			return
		this.#playEatSE()
		this.resetTimer()
		Maze.hasPow(tileIdx)
			? this.#eatPowerDot()
			: this.#eatSmallDot()
		Maze.clearDot(this) <= Maze.CLEAR_DOTS
			? State.setRoundEnds()
			: EventBus.trigger(EATEN_EV)
	}
	#eatPowerDot() {
		Score.add(POW_PTS)
		Ghosts.frighten()
	}
	#eatSmallDot() {
		Score.add(DOT_PTS)
	}
	#playEatSE() {
		const duration = (T/this.speed)*Ticker.Interval*.5
		;(this.#wakaWakaSEIndex ^= 1)
			? Sound.playWakaWaka0({duration})
			: Sound.playWakaWaka1({duration})
	}
}

export function onPlayerDotEaten(
  /**@type {JQTriggerHandler}*/cb
) {return EventBus.on(EATEN_EV,cb)}

export let player = new Player
export let pActor = /**@type {Actor}*/(player)
State.on({_Ready:()=> {
	fadePlayer = State.isTitle? null : Fade.in()
	!State.wasNewGame && (player = pActor = new Player)
}})
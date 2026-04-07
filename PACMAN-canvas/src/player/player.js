import {Sound}    from '../../_snd/sound.js'
import {Game}     from '../_main.js'
import {Ctrl}     from '../control.js'
import {State}    from '../state.js'
import {ScoreMgr} from '../score.js'
import {MazeMgr}  from '../maze.js'
import {PacMan}   from '../actor.js'
import {GhostMgr} from '../ghosts/_system.js'
import {Mover}    from './controller.js'
import {TunEntry} from './tunnel.js'

const EventBus = $({})
const EatenEvt = 'DotEaten'

let fader = /**@type {?Fade}*/(null)

class Player extends PacMan {
	#eatIdx = 0
	#sinceLastEating = 0

	/** @type {Mover} */
	#mov      = new Mover(this)
	#tunEntry = new TunEntry
	constructor() {super(13.5, 24)}

	get speed()    {return this.#mov.speed}
	get onWall()   {return this.#mov.onWall}
	get tunEntry() {return this.#tunEntry}
	get alpha()    {return fader?.alpha ?? this.maxAlpha}
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
		if (State.isIntro) return
		this.sprite.draw(this)
		this.drawCenterDot()
	}
	drawCenterDot() {
		if (!this.hidden && Ctrl.showGridLines)
			super.drawCenterDot()
	}
	update() {
		this.sprite.update(this)
		fader?.update(this.maxAlpha)
		if (!this.closed && !this.hidden) {
			this.#sinceLastEating += Game.interval
			this.#tunEntry.update()
			this.#update(this.#mov.speed+.5|0)
		}
		if (!State.isInGame)
			this.keepInsideBoard()
	}
	#update(steps=1) {
		for (const _ of range(steps)) {
			this.#eatDot(this.tileIdx)
			this.#mov.update(this.speed/steps)
			if (this.onWall) break
		}
	}
	#eatDot(tileIdx=-1) {
		if (!MazeMgr.hasDot(tileIdx)) return
		this.#playEatSE()
		this.resetTimer()
		MazeMgr.hasPow(tileIdx)
			? this.#eatPowerDot()
			: this.#eatSmallDot()
		MazeMgr.clearDot(this) == 0
			? State.setRoundEnds()
			: EventBus.trigger(EatenEvt)
	}
	#eatPowerDot() {
		ScoreMgr.add(PowPts)
		GhostMgr.frighten()
	}
	#eatSmallDot() {
		ScoreMgr.add(DotPts)
	}
	#playEatSE() {
		const duration = (T/this.speed)*Ticker.Interval*.5
		;(this.#eatIdx ^= 1)
			? Sound.playWakaWaka0({duration})
			: Sound.playWakaWaka1({duration})
	}
}

export let player = new Player
export const onPlayerDotEaten =
	(/**@type {JQTriggerHandler}*/cb)=>
		{EventBus.on(EatenEvt,cb)}

State.on({_Ready:()=> {
	fader = State.isTitle? null : Fade.in()
	!State.wasIntro && (player = new Player)
}})
import {Sound}    from '../../_snd/sound.js'
import {Game}     from '../_main.js'
import {Env,Cfg}  from '../env.js'
import {State}    from '../state.js'
import {Score}    from '../score.js'
import {Maze}     from '../maze.js'
import  PacSpr    from '../sprites/pacman.js'
import {Mover}    from './controller.js'
import {TunEntry} from './tunnel.js'
import {Actor,Ghosts} from '../actors.js'

const EventBus = $({})
const EATEN_EV = 'DotEaten'

export class PacMan extends Actor {
	/** @readonly */
	sprite = new PacSpr(Fg,T)
	constructor(col=0,row=0) {super(col,row)}
	get hidden() {return Timer.frozen}
	draw()   {this.sprite.draw(this)}
	update() {this.sprite.update(this)}
}

class Player extends PacMan {
	static {State.on({_Ready:this.instantiate})}
	static instantiate() {
		!State.wasNewGame && (player = new Player)
		!State.isTitle && (player.fadeSpr = Fade.in())
	}
	#eatingSEToggle  = 1
	#sinceLastEating = 0

	/** @type {Mover} */
	#mov      = new Mover(this)
	#tunEntry = new TunEntry()
	constructor() {super(13.5, 24)}

	get speed()    {return this.#mov.speed}
	get onWall()   {return this.#mov.onWall}
	get tunEntry() {return this.#tunEntry}
	get maxAlpha() {return Env.semiTransPac? Actor.CHEAT_ALPHA:1}
	get closed()   {return State.isInGame == false}
	get timeSinceLastEating() {return this.#sinceLastEating}

	resetTimer() {
		this.#sinceLastEating = 0
	}
	offsetTarget(dist=T*2) {
		const  ofstX = (this.dir == U ? -dist : 0)
		return this.forward(this.dir, dist).addX(ofstX)
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
		this.fadeSpr?.update(this.maxAlpha)
		this.closed
			? this.keepInsideBoard()
			: this.#updateMovement()
	}
	#updateMovement() {
		if (this.hidden) return
		this.#tunEntry.update()
		this.#sinceLastEating += Game.interval
		this.#moveSteps(this.speed+.5|0)
	}
	#moveSteps(steps=1) {
		const {tileIdx:tIdx,speed}= this
		for (let i=0; i<steps; i++) {
			Maze.hasDot(tIdx) && this.#eatDot(tIdx)
			if (this.#mov.update(speed/steps)) break
		}
	}
	#eatDot(/**@type {TileIdx}*/i) {
		this.#playEatingSE()
		this.resetTimer()
		Maze.hasPow(i)
			? Score.add(POW_PTS) && Ghosts.frighten()
			: Score.add(DOT_PTS)
		Maze.clearDot(this) <= Maze.CLEAR_DOTS
			? State.setRoundEnds()
			: EventBus.trigger(EATEN_EV)
	}
	#playEatingSE() {
		const duration = (T/this.speed)*Ticker.Interval*.5
		;(this.#eatingSEToggle ^= 1)
			? Sound.playEatsDot0({duration})
			: Sound.playEatsDot1({duration})
	}
}
export let player = new Player()
export const onPlayerDotEaten =
(/**@type {JQTriggerHandler}*/cb)=> {
	EventBus.on(EATEN_EV,cb)
}
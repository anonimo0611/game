import {Sound}    from '../../_snd/sound.js'
import {Game}     from '../_main.js'
import {Env,Cfg}  from '../control.js'
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
		this.fadeSpr?.update(this.maxAlpha)
		if (!this.closed && !this.hidden) {
			this.#tunEntry.update()
			this.#sinceLastEating += Game.interval
			this.#moveSteps(this.speed+.5|0)
		}
		if (!State.isInGame)
			this.keepInsideBoard()
	}
	#moveSteps(steps=1) {
		for (let i=0; i<steps; i++) {
			this.#eatDot(this.tileIdx)
			const spd = this.speed/steps
			if (this.#mov.update(spd)) break
		}
	}
	#eatDot(tileIdx=-1) {
		if (!Maze.hasDot(tileIdx))
			return
		this.#playEatingSE()
		this.resetTimer()
		Maze.hasPow(tileIdx)
			? (Score.add(POW_PTS), Ghosts.frighten())
			: (Score.add(DOT_PTS))
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
export let player = new Player
export const onPlayerDotEaten =
(/**@type {JQTriggerHandler}*/cb)=> {
	EventBus.on(EATEN_EV,cb)
}
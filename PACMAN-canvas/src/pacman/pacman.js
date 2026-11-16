import {Sound}   from '../../_snd/sound.js'
import {Game}    from '../_main.js'
import {Env,Cfg} from '../env.js'
import {State}   from '../state.js'
import {Score}   from '../score.js'
import {Maze}    from '../maze.js'
import  PacSpr   from '../sprites/pacman.js'
import {TunnelEntry}  from './tunnel.js'
import {createMover}  from './controller.js'
import {Actor,Ghosts} from '../actors.js'

const EventBus = $({})
const EATEN_EV = 'DotEaten'

export class PacMan extends Actor {
	/** @readonly */
	sprite = new PacSpr(Fg,T,0)
	constructor(col=0,row=0) {super(col,row)}
	get hidden() {return Timer.frozen}
	draw()   {this.sprite.draw(this)}
	update() {this.sprite.update(this)}
}

class Player extends PacMan {
	static {State.on({_Ready:this.instantiate})}
	static instantiate() {
		!State.wasNewGame && (player = new Player)
		!State.isTitle && player.fadeIn()
	}
	#eatingSoundToggle   = 1
	#timeSinceLastEating = 0

	/** @readonly @private */
	mover = createMover(this)

	/** @readonly */
	tunEntry = new TunnelEntry()

	constructor()  {super(13.5, 24)}
	get speed()    {return this.mover.speed}
	get onWall()   {return this.mover.onWall}
	get maxAlpha() {return Env.semiTransPac? Actor.CHEAT_ALPHA:1}
	get closed()   {return State.isInGame == false}

	get timeSinceLastEating() {
		return this.#timeSinceLastEating
	}
	resetTimer() {
		this.#timeSinceLastEating = 0
	}
	offsetTarget(dist=T*2) {
		const ofstX = (this.dir == DirU ? -dist : 0)
		return this.forward(this.dir, dist).addX(ofstX)
	}
	drawCenterDot() {
		if (!this.hidden && Cfg.showGridLines)
			super.drawCenterDot()
	}
	draw() {
		if (State.isNewGame) return
		this.sprite.draw(this)
		this.drawCenterDot()
	}
	update() {
		this.updateFade()
		this.sprite.update(this, Game.speed)
		this.#updateMovement()
	}
	#updateMovement() {
		if (this.closed) return
		if (this.hidden) return
		this.tunEntry.update()
		this.#timeSinceLastEating += Game.interval
		this.#moveSteps(this.speed+.5|0)
	}
	#moveSteps(steps=1) {
		const {tileIdx:tIdx}= this
		for (let i=0; i<steps; i++) {
			const step = roundTo(this.speed/steps)
			Maze.hasDot(tIdx) && this.#eatDot(tIdx)
			if (this.mover.update(step)) break
		}
	}
	#eatDot(/**@type {TileIdx}*/i) {
		this.#playEatingSE()
		this.resetTimer()
		Maze.hasPow(i)
			? Score.add(POW_PTS) && Ghosts.frighten()
			: Score.add(DOT_PTS)
		Maze.clearDot(i) <= Maze.CLEAR_DOTS
			? State.setRoundEnds()
			: EventBus.trigger(EATEN_EV)
	}
	#playEatingSE() {
		const duration = (T/this.speed)*Ticker.Interval*.5
		;(this.#eatingSoundToggle ^= 1)
			? Sound.playEatsDot0({duration})
			: Sound.playEatsDot1({duration})
	}
}
export let player = new Player()
export const onPlayerDotEaten =
(/**@type {JQTriggerHandler}*/cb)=> {
	EventBus.on(EATEN_EV,cb)
}
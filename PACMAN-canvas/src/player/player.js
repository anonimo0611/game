import {Sound}    from '../../_snd/sound.js'
import {Game}     from '../_main.js'
import {Ctrl}     from '../control.js'
import {State}    from '../state.js'
import {Score}    from '../score.js'
import {Maze}     from '../maze.js'
import {Actor}    from '../actor.js'
import {PacMan}   from '../actor.js'
import {GhsMgr}   from '../ghosts/_system.js'
import {Mover}    from './controller.js'
import {TunEntry} from './tunnel.js'

const AteDotEvent = 'AteDot'

class PlayerCore extends PacMan {
	#eatIdx = 0
	#sinceLastEating = 0

	/** @private @type {Mover} */
	mov        = new Mover(this)
	#tunEntry  = new TunEntry
	#spawnFade = new Actor.SpawnFade

	constructor()  {super(13.5, 24)}
	get closed()   {return State.isInGame == false}
	get maxAlpha() {return Ctrl.semiTransPac? .75:1}
	get speed()    {return this.mov.speed}
	get onWall()   {return this.mov.onWall}
	get tunEntry() {return this.#tunEntry}

	get timeSinceLastEating() {
		return this.#sinceLastEating
	}
	resetTimer() {
		this.#sinceLastEating = 0
	}
	drawCenterDot() {
		if (!this.hidden && Ctrl.showGridLines)
			super.drawCenterDot()
	}
	draw() {
		if (State.isIntro)
			return
		Ctx.save()
		this.#spawnFade.apply(this.maxAlpha)
		this.sprite.draw(this)
		this.drawCenterDot()
		Ctx.restore()
	}
	update() {
		this.#spawnFade.update(this.maxAlpha)
		this.sprite.update(this)
		if (this.closed || this.hidden)
			return
		this.#sinceLastEating += Game.interval
		this.#tunEntry.update()
		this.#update(this.mov.speed+.5|0)
	}
	#update(steps=1) {
		for (const _ of range(steps)) {
			this.#eatDot(this.tileIdx)
			this.mov.update(this.speed/steps)
			if (this.mov.onWall) break
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
		Maze.clearDot(this) == 0
			? State.toCleared()
			: $(Player).trigger(AteDotEvent)
	}
	#eatPowerDot() {
		Score.add(PowPts)
		GhsMgr.setFrightMode()
	}
	#eatSmallDot() {
		Score.add(DotPts)
	}
	#playEatSE() {
		const duration = (T/this.speed) * Ticker.Interval * .5
		;(this.#eatIdx ^= 1)
			? Sound.playEatSE0({duration})
			: Sound.playEatSE1({duration})
	}
}

export const Player = function() {
	let core = new PlayerCore
	function init() {
		!State.wasIntro && (core = new PlayerCore)
	}
	State.on({_Ready:init})
	return {
		get core() {return core},
		forwardPos(num=0) {
			return Vec2[core.dir].mul(num*T).add(core.center)
		},
		offsetTarget(num=0) {
			const  ofstX = (core.dir == U ? -num : 0)
			return this.forwardPos(num).addX(ofstX*T)
		},
		/** @param {JQTriggerHandler} handler */
		onAte(handler) {$(this).on(AteDotEvent, handler)},
	}
}()
import {Sound}    from '../../_snd/sound.js'
import {Game}     from '../_main.js'
import {Ctrl}     from '../control.js'
import {State}    from '../state.js'
import {Score}    from '../score.js'
import {Maze}     from '../maze.js'
import {PacMan}   from '../actor.js'
import {GhsMgr}   from '../ghosts/_system.js'
import {Mover}    from './controller.js'
import {TunEntry} from './tunnel.js'

let  _fader = /**@type {?Fade}*/(null)
const AteDotEvent = 'AteDot'

class PlayerCore extends PacMan {
	#eatIdx = 0
	#sinceLastEating = 0

	/**@type {Mover}*/
	#mov      = new Mover(this)
	#tunEntry = new TunEntry

	get speed()    {return this.#mov.speed}
	get onWall()   {return this.#mov.onWall}
	get tunEntry() {return this.#tunEntry}
	get alpha()    {return _fader?.alpha ?? this.maxAlpha}
	get maxAlpha() {return Ctrl.semiTransPac? .75:1}
	get closed()   {return State.isInGame == false}
	get timeSinceLastEating() {return this.#sinceLastEating}

	constructor() {super(13.5, 24)}
	resetTimer() {
		this.#sinceLastEating = 0
	}
	forwardPos(num=0) {
		return Vec2[this.dir].mul(num*T).add(this.center)
	}
	offsetTarget(num=0) {
		const  ofstX = (this.dir == U ? -num : 0)
		return this.forwardPos(num).addX(ofstX*T)
	}
	drawCenterDot() {
		if (!this.hidden && Ctrl.showGridLines)
			super.drawCenterDot()
	}
	draw() {
		if (State.isIntro)
			return
		this.sprite.draw(this)
		this.drawCenterDot()
	}
	update() {
		this.sprite.update(this)
		_fader?.update(this.maxAlpha)
		if (this.closed || this.hidden)
			return
		this.#sinceLastEating += Game.interval
		this.#tunEntry.update()
		this.#update(this.#mov.speed+.5|0)
	}
	#update(steps=1) {
		for (const _ of range(steps)) {
			this.#eatDot(this.tileIdx)
			this.#mov.update(this.speed/steps)
			if (this.onWall) break
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
		const duration = (T/this.speed)*Ticker.Interval*.5
		;(this.#eatIdx ^= 1)
			? Sound.playEatSE0({duration})
			: Sound.playEatSE1({duration})
	}
}

export const Player = function() {
	let core = new PlayerCore
	function init() {
		!State.wasIntro && (core = new PlayerCore)
		_fader = State.isTitle? null : Fade.in()
	}
	State.on({_Ready:init})
	return {
		get core() {return core},
		onAte(/**@type {JQTriggerHandler}*/handler) {
			$(this).on(AteDotEvent, handler)
		},
		forwardPos:  (num=0)=> core.forwardPos(num),
		offsetTarget:(num=0)=> core.offsetTarget(num),
	}
}()
import {Sound}  from '../../_snd/sound.js'
import {Common} from '../../_lib/common.js'
import {Game}   from '../_main.js'
import {State}  from '../state.js'
import {Score}  from '../score.js'
import {Maze}   from '../maze.js'
import {Actor}  from '../actor.js'
import {GhsMgr} from '../ghosts/_system.js'
import Sprite   from '../sprites/pacman.js'
import {Mover}  from './controller.js'
import {PlayerState} from './state.js'
import {TunnelEntry} from './tunnel.js'

class PlayerPac extends PlayerState {
	#mover    = new Mover
	#tunEntry = new TunnelEntry
	#fadeIn   = new Actor.SpawnFadeIn
	#eatSoundIndex     = 0
	#framesSinceEating = 0

	/** @readonly */
	sprite = new Sprite(Ctx)

	get stopped()      {return this.#mover.stopped}
	get dir()          {return this.#mover.dir}
	get orient()       {return this.#mover.orient}
	get pos()          {return this.#mover.pos}
	get center()       {return this.#mover.center}
	get inTunSide()    {return this.#mover.inTunSide}
	get TunnelEntry()  {return this.#tunEntry}
	get timeNotEaten() {return this.#framesSinceEating*Game.interval}

	constructor() {
		super()
		this.#mover.pos.set(13.5*T, 24*T)
	}
	forwardPos(num=0) {
		return Vec2[this.dir].mul(num*T).add(this.center)
	}
	offsetTarget(num=0) {
		const  ofstX = (this.dir == U ? -num : 0)
		return this.forwardPos(num).addX(ofstX*T)
	}
	resetTimer() {
		this.#framesSinceEating = 0
	}
	drawCenterDot() {
		if (!this.hidden && !this.dying && this.showCenter)
			this.#mover.drawCenterDot()
	}
	draw() {
		if (State.isStarting) return
		Ctx.save()
		this.#fadeIn.setAlpha(this.maxAlpha)
		this.sprite.draw(this)
		this.drawCenterDot()
		Ctx.restore()
	}
	update() {
		this.#fadeIn.update(this.maxAlpha)
		if (this.mouseClosed || this.hidden) return
		this.#framesSinceEating++
		this.#tunEntry.update()
		this.sprite.update(this)
		this.#processBehavior(this.#mover.speed+.5|0)
	}
	#processBehavior(divisor=1) {
		for (const _ of range(divisor)) {
			this.#eatDot(this.#mover)
			this.#mover.update(divisor)
			if (this.stopped) break
		}
		this.#mover.stopAtWall()
	}
	#eatDot({tileIdx,tilePos}=this.#mover) {
		if (!Maze.hasDot(tileIdx)) return
		this.#playEateSE()
		this.resetTimer()
		Maze.hasPow(tileIdx)
			? this.#eatPowerDot()
			: this.#eatSmallDot()
		Maze.clearBgDot({tileIdx,tilePos}) == 0
			? State.toCleared()
			: Player.trigger('Eaten')
	}
	#eatPowerDot() {
		Score.add(PowPts)
		GhsMgr.setFrightMode()
	}
	#eatSmallDot() {
		Score.add(DotPts)
	}
	#playEateSE() {
		const id  = (this.#eatSoundIndex ^= 1) ? 'eat1':'eat0'
		const dur = (T/this.#mover.speed)*Ticker.Interval*0.5
		Sound.play(id, {duration:dur})
	}
}

/** @type {PlayerPac} */
export let   player
export const Player = new class extends Common {
	draw()  {player.draw()}
	update(){player.update()}
}
const
reset = ()=> {player = new PlayerPac}
reset();State.on({_Restarted_NewLevel:reset})
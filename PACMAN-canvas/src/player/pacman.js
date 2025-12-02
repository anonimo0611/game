import {Sound}  from '../../_snd/sound.js'
import {Common} from '../../_lib/common.js'
import {Game}   from '../_main.js'
import {State}  from '../state.js'
import {Ctrl}   from '../control.js'
import {Score}  from '../score.js'
import {Maze}   from '../maze.js'
import {Actor}  from '../actor.js'
import {GhsMgr} from '../ghosts/_system.js'
import Sprite   from '../sprites/pacman.js'
import {TunnelEntry} from './tunnel.js'
import {MoveControl} from './controller.js'

class PacMan {
	/** @readonly */
	sprite = new Sprite(Ctx)
	pos = Vec2.Zero
	get x()           {return this.pos.x}
	get y()           {return this.pos.y}
	get maxAlpha()    {return this.isSemiTrans? .75:1}
	get radius()      {return PacRadius}
	get hidden()      {return Timer.frozen}
	get showCenter()  {return Ctrl.showGridLines}
	get isSemiTrans() {return Ctrl.invincible   || this.showCenter}
	get dying()       {return State.isPacCaught || State.isPacDying}
	get mouseClosed() {return State.isPlaying == false}
}

class PlayerPac extends PacMan {
	#eatSoundIndex     = 0
	#framesSinceEating = 0

	#mover    = new MoveControl
	#tunEntry = new TunnelEntry
	#fadeIn   = new Actor.SpawnFadeIn

	get dir()          {return this.#mover.dir}
	get orient()       {return this.#mover.orient}
	get center()       {return this.#mover.center}
	get speed()        {return this.#mover.speed}
	get stopped()      {return this.#mover.stopped}
	get TunnelEntry()  {return this.#tunEntry}
	get timeNotEaten() {return this.#framesSinceEating * Game.interval}

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
		if (this.mouseClosed || this.hidden)
			return
		this.sprite.update(this)
		this.#framesSinceEating++
		this.#tunEntry.update()
		this.#processBehavior(this.speed+.5|0)
	}
	#processBehavior(divisor=1) {
		for (const _ of range(divisor)) {
			this.#eatDot(this.#mover.tileIdx)
			this.#mover.update(divisor)
			this.pos = this.#mover.pos
			if (this.stopped) break
		}
		this.#mover.stopAtWall()
	}
	#eatDot(/**@type {number}*/tileIdx) {
		if (!Maze.hasDot(tileIdx))
			return
		this.#playEateSE()
		this.resetTimer()
		Maze.hasPow(tileIdx)
			? this.#eatPowerDot()
			: this.#eatSmallDot()
		Maze.clearBgDot(this.#mover) == 0
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
		const id = (this.#eatSoundIndex ^= 1) ? 'eat1':'eat0'
		Sound.play(id, {duration:(T/this.speed)*Ticker.Interval*0.5})
	}
}

export let   pacman = new PlayerPac
export const Player = new class extends Common {
	draw()   {pacman.draw()}
	update() {pacman.update()}
}
const reset = ()=> {
	$win.off('keydown.PacSteer')
	pacman = new PlayerPac
}
State.on({_Restarted_NewLevel:reset})
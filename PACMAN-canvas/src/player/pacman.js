import {Sound}  from '../../_snd/sound.js'
import {Common} from '../../_lib/common.js'
import {Game}   from '../_main.js'
import {State}  from '../state.js'
import {Ctrl}   from '../control.js'
import {Score}  from '../score.js'
import {Maze}   from '../maze.js'
import {Pacman} from '../pacman.js'
import {GhsMgr} from '../ghosts/_system.js'
import {Mover}  from './controller.js'
import {TunnelEntry} from './tunnel.js'

class PlayerPac extends Pacman {
	#mover    = new Mover
	#tunEntry = new TunnelEntry
	#eatSE_Index = 0
	#framesSinceEating = 0

	get showCenterDot() {return Ctrl.showGridLines}
	get isSemiTrans()   {return Ctrl.invincible || this.showCenterDot}
	get dying()         {return State.isPacCaught  || State.isPacDying}
	get mouseClosed()   {return State.isPlaying == false}
	get maxAlpha()      {return this.isSemiTrans? .75:1}
	get speed()         {return this.#mover.speed}
	get stopped()       {return this.#mover.stopped}
	get TunnelEntry()   {return this.#tunEntry}
	get timeNotEaten()  {return this.#framesSinceEating * Game.interval}

	constructor() {
		super()
		this.pos.set(13.5*T, 24*T)
	}
	resetTimer() {
		this.#framesSinceEating = 0
	}
	forwardPos(num=0) {
		return Vec2[this.dir].mul(num*T).add(this.center)
	}
	offsetTarget(num=0) {
		const  ofstX = (this.dir == U ? -num : 0)
		return this.forwardPos(num).addX(ofstX*T)
	}
	drawCenterDot() {
		if (!this.hidden && !this.dying && this.showCenterDot)
			super.drawCenterDot()
	}
	draw() {
		if (State.isStarting) return
		Ctx.save()
		this.setFadeInAlpha()
		this.sprite.draw(this)
		this.drawCenterDot()
		Ctx.restore()
	}
	update() {
		this.updateFadeIn()
		if (this.mouseClosed || this.hidden)
			return
		this.sprite.update(this)
		this.#framesSinceEating++
		this.#tunEntry.update()
		this.#processBehavior(this.speed+.5|0)
	}
	#processBehavior(divisor=1) {
		for (const _ of range(divisor)) {
			this.#eatDot(this)
			this.#mover.update(divisor)
			if (this.stopped) break
		}
	}
	#eatDot({tileIdx:i}=this) {
		if (!Maze.hasDot(i))
			return
		this.#playEateSE()
		this.resetTimer()
		Maze.hasPow(i)
			? this.#eatPowerDot()
			: this.#eatSmallDot()
		Maze.clearBgDot(this) == 0
			? State.to('Cleared')
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
		const id = (this.#eatSE_index ^= 1) ? 'eat1':'eat0'
		Sound.play(id, {duration:(T/this.speed)*Ticker.Interval*0.5})
	}
}
export let   pacman = new PlayerPac
export const Player = new class extends Common {
	draw()   {pacman.draw()}
	update() {pacman.update()}
}
State.on({_Restarted_NewLevel:()=> pacman = new PlayerPac})

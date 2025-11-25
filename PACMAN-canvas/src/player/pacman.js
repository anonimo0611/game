import {Sound}  from '../../_snd/sound.js'
import {Common} from '../../_lib/common.js'
import {Game}   from '../_main.js'
import {State}  from '../state.js'
import {Ctrl}   from '../control.js'
import {Score}  from '../score.js'
import {Maze}   from '../maze.js'
import {Pacman} from '../pacman.js'
import {GhsMgr} from '../ghosts/_system.js'
import {Mover}   from './mover.js'
import {TunnelEntryMgr} from './tunnel.js'

class PlayerPac extends Pacman {
	#eatIdx   = 0
	#notEaten = 0
	#mover    = new Mover()
	#tunMgr   = new TunnelEntryMgr()

	get showCenter()    {return Ctrl.showGridLines}
	get isSemiTrans()   {return Ctrl.invincible || this.showCenter}
	get dying()         {return State.isCrashed || State.isDying}
	get mouseClosed()   {return State.isPlaying == false}
	get maxAlpha()      {return this.isSemiTrans? .75:1}
	get step()          {return this.#mover.step}
	get stopped()       {return this.#mover.stopped}
	get tunnelEntered() {return this.#tunMgr}
	get timeNotEaten()  {return this.#notEaten * Game.interval}

	constructor() {
		super()
		this.pos.set(13.5*T, 24*T)
	}
	resetTimer() {
		this.#notEaten = 0
	}
	forwardPos(num=0) {
		return Vec2[this.dir].mul(num*T).add(this.center)
	}
	offsetTarget(num=0) {
		const  ofstX = (this.dir == U ? -num : 0)
		return this.forwardPos(num).addX(ofstX*T)
	}
	drawCenter() {
		if (!this.hidden && !this.dying && this.showCenter)
			super.drawCenter()
	}
	draw() {
		if (State.isStart) return
		Ctx.save()
		this.setFadeInAlpha()
		this.sprite.draw(this)
		this.drawCenter()
		Ctx.restore()
	}
	update() {
		this.updateFadeIn()
		if (this.mouseClosed || this.hidden)
			return
		this.sprite.update(this)
		this.#notEaten++
		this.#tunMgr.update()
		this.#behavior(this.step+.5|0)
	}
	#behavior(divisor=1) {
		for (const _ of range(divisor)) {
			this.#dotEaten(this)
			this.#mover.update(divisor)
			if (this.stopped) break
		}
	}
	#dotEaten({tileIdx:i}=this) {
		if (!Maze.hasDot(i))
			return
		this.#playSE()
		this.resetTimer()
		Maze.hasPow(i)
			? this.#powerDotEaten()
			: this.#smallDotEaten()
		Maze.clearBgDot(this) == 0
			? State.to('Clear')
			: Player.trigger('Eaten')
	}
	#powerDotEaten() {
		Score.add(PowPts)
		GhsMgr.setFrightMode()
	}
	#smallDotEaten() {
		Score.add(DotPts)
	}
	#playSE() {
		const id = (this.#eatIdx ^= 1) ? 'eat1':'eat0'
		Sound.play(id, {duration:(T/this.step)*Ticker.Interval*0.5})
	}
}
export let   pacman = new PlayerPac
export const Player = new class extends Common {
	draw()   {pacman.draw()}
	update() {pacman.update()}
}
State.on({_Restart_NewLevel:()=> pacman = new PlayerPac})
import {Sound}  from '../../_snd/sound.js'
import {Common} from '../../_lib/common.js'
import {Game}   from '../_main.js'
import {State}  from '../state.js'
import {Ctrl}   from '../control.js'
import {Score}  from '../score.js'
import {Maze}   from '../maze.js'
import {Pacman} from '../pacman.js'
import {GhsMgr} from '../ghosts/_system.js'
import {Steer}   from './steer.js'
import {TunnelEntered} from './tunnel.js'

class PlayerPac extends Pacman {
	#eatIdx     = 0
	#notEaten   = 0
	#steer      = new Steer()
	#tunEntered = new TunnelEntered()

	get closed()        {return State.isPlaying == false}
	get showCenter()    {return Ctrl.showGridLines}
	get maxAlpha()      {return this.translucent? 0.75:1}
	get translucent()   {return this.showCenter || Ctrl.invincible}
	get step()          {return this.#steer.step}
	get stopped()       {return this.#steer.stopped}
	get tunnelEntered() {return this.#tunEntered}
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
	forwardOfst(num=0) {
		const  ofstX = (this.dir == U ? -num : 0)
		return this.forwardPos(num).addX(ofstX*T)
	}
	draw() {
		if (State.isStart)
			return
		Ctx.save()
		this.setFadeInAlpha()
		this.sprite.draw(this)
		this.showCenter && this.drawCenter()
		Ctx.restore()
	}
	update() {
		this.updateFadeIn()
		if (!State.isPlaying || Timer.frozen)
			return
		this.sprite.update(this)
		this.#notEaten++
		this.#tunEntered.update()
		this.#behavior(this.step+.5|0)
	}
	#behavior(divisor=1) {
		for (const _ of range(divisor)) {
			this.#dotEaten(this)
			this.#steer.update(divisor)
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
		Score.add(PowScore)
		GhsMgr.setFrightMode()
	}
	#smallDotEaten() {
		Score.add(DotScore)
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
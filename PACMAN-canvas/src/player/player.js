import {Sound}  from '../../_snd/sound.js'
import {Common} from '../../_lib/common.js'
import {Game}   from '../_main.js'
import {State}  from '../state.js'
import {Ctrl}   from '../control.js'
import {Score}  from '../score.js'
import {Maze}   from '../maze.js'
import {Pacman} from '../pacman.js'
import {GhsMgr} from '../ghosts/_system.js'
import {Steer}  from './steer.js'

const{SlowLevel,SlowRate}= PacStep
class PlayerPac extends Pacman {
	#step     = 0
	#eatIdx   = 0
	#notEaten = 0
	#stopped  = true
	get entryTunnel()  {return EntryTunnel.side}
	get closed()       {return State.isPlaying == false}
	get showCenter()   {return Ctrl.showGridLines}
	get step()         {return this.#step}
	get stopped()      {return this.#stopped}
	get timeNotEaten() {return this.#notEaten * Game.interval}
	get translucent()  {return this.showCenter || Ctrl.invincible}
	get maxAlpha()     {return this.translucent? 0.75:1}

	constructor() {
		super()
		/** @private @readonly */
		this.steer = new Steer()
		this.pos = Vec2(13.5, 24).mul(T)
	}
	get baseSpeed() {
		return Game.moveSpeed
			* (Game.level < SlowLevel ? 1:SlowRate)
	}
	#getCurrentStep() {
		const eating = Maze.hasDot(this.tileIdx)
		return(GhsMgr.isFright
			? (eating? PacStep.EneEat : PacStep.Energized)
			: (eating? PacStep.Eating : PacStep.Base)
		) * this.baseSpeed
	}
	resetTimer() {
		this.#notEaten = 0
	}
	forwardPos(num=0) {
		return Vec2[this.dir].mul(num*T).add(this.center)
	}
	forwardOfst(num=0) {
		const  ofstX = (this.dir == U ? -num : 0)
		return this.forwardPos(num).add(ofstX*T, 0)
	}
	#drawCenter({center:{x,y}}=this) {
		Ctx.fillCircle(x,y, 3, Color.PacCenter)
	}
	draw() {
		if (State.isStart) return
		Ctx.save()
		super.draw()
		this.sprite.draw(this)
		this.showCenter && this.#drawCenter(this)
		Ctx.restore()
	}
	update() {
		super.update()
		if (!State.isPlaying || Timer.frozen) return
		EntryTunnel.update()
		this.sprite.update(this)
		this.#notEaten++
		for (const _ of range(this.stepDiv))
			this.#behavior(this.stepDiv)
	}
	#behavior(divisor=1) {
		if (this.#step == 0 || this.justInNewTile(divisor))
			this.#step = this.#getCurrentStep()
		this.steer.move(divisor)
		this.#eaten(this)
		this.#stopped = this.steer.stopAtWall()
	}
	#eaten({tileIdx:i}=this) {
		if (!Maze.hasDot(i)) return
		this.#playSE()
		this.resetTimer()
		Maze.hasPow(i)
			? this.#powEaten()
			: this.#dotEaten()
		Maze.clearBgDot(this) == 0
			? State.to('Clear')
			: Player.trigger('Eaten')
	}
	#dotEaten() {
		Score.add(DotScore)
	}
	#powEaten() {
		Score.add(PowScore)
		GhsMgr.setFrightMode()
	}
	#playSE() {
		const id = (this.#eatIdx ^= 1) ? 'eat1':'eat0'
		Sound.play(id, {duration:(T/this.step)*Ticker.Interval*0.5})
	}
}

export let   player = new PlayerPac
export const Player = function() {
	State.on({_Restart_NewLevel:()=> player = new PlayerPac})
	return new class extends Common {
		get instance() {return player}
		draw()   {return player.draw()}
		update() {return player.update()}
	}
}()

const EntryTunnel = new class {
	#side = /**@type {?Direction}*/(null)
	get side() {return this.#side}
	update() {
		player.inTunnel == false && (this.#side = null)
		player.inTunnelR && player.dir == R && (this.#side ||= R)
		player.inTunnelL && player.dir == L && (this.#side ||= L)
	}
}
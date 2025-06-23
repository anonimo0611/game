import {Sound}   from '../_snd/sound.js'
import {Confirm} from '../_lib/confirm.js'
import {Common}  from '../_lib/common.js'
import {Dir}     from '../_lib/direction.js'
import {Game}    from './_main.js'
import {State}   from './state.js'
import {Ctrl}    from './control.js'
import {Score}   from './score.js'
import {Maze}    from './maze.js'
import {Actor}   from './actor.js'
import {GhsMgr}  from './ghosts/_system.js'
import Sprite    from './sprites/pacman.js'

const Step = PacStep

export const Player = function() {
	/** @type {PlayablePac} */
	let player
	$on({Title_Restart_NewLevel:()=> player = new PlayablePac})
	return new class extends Common {get instance() {return player}}
}()

export class Pacman extends Actor {
	radius = PacRadius
	sprite = new Sprite(Ctx)
	constructor() {super(),freeze(this)}
}
class PlayablePac extends Pacman {
	#step     = this.#getStep()
	#notEaten = 0
	#turning  = false
	#stopped  = true
	#eatIdx   = /**@type {0|1}*/(0)
	#preDir   = /**@type {?Direction}*/(null)
	#nextDir  = /**@type {?Direction}*/(null)

	get closed()       {return State.isPlaying == false}
	get showCenter()   {return Ctrl.showGridLines}
	get step()         {return this.#step}
	get stopped()      {return this.#stopped}
	get timeNotEaten() {return this.#notEaten * Game.interval}
	get translucent()  {return this.showCenter || Ctrl.invincible}
	get maxAlpha()     {return this.translucent? 0.75:1}

	constructor() {
		super()
		this.pos = Vec2(13.5, 24).mul(T)
		$offon('keydown.Player', this.#onKeydown.bind(this))
	}
	get canTurn() {
		return this.inFrontOfTile
			&& this.#preDir != null
			&& this.collidedWithWall(this.#preDir) === false
	}
	get baseSpeed() {
		return Game.moveSpeed
			* (Game.level<Step.SlowLevel ? 1 : Step.SlowRate)
	}
	#getStep() {
		const eating = Maze.hasDot(this.tileIdx)
		return(GhsMgr.isFright
			? (eating? Step.EneEat : Step.Energized)
			: (eating? Step.Eating : Step.Base)
		) * this.baseSpeed
	}
	#allowKey(/**@type {KeyboardEvent}*/e) {
		const dir = Dir.from(e, {wasd:true})
		return (Confirm.opened
			|| keyRepeat(e)
			|| (dir == null)
			|| (dir == this.dir && !this.#turning)
		)? null : dir
	}
	#onKeydown(/**@type {KeyboardEvent}*/e) {
		const dir = this.#allowKey(e)
		if (!dir) return
		if (this.#turning) {
			this.#nextDir = dir
			return
		}
		if (this.hasAdjWall(dir)) {
			this.#preDir = dir
			return
		}
		if (State.isSt_Ready && Vec2[dir].x || this.stopped) {
			[this.#preDir,this.dir] = [null,dir]
			return
		}
		this.#preDir = dir
		if (this.inBackOfTile) {
			this.orient = dir
			this.setMoveDir(this.revDir)
		}
	}
	resetTimer() {
		this.#notEaten = 0
	}
	forwardPos(num=0) {
		const  ofstX = (this.dir == U ? -num : 0)
		return Vec2[this.dir].mul(num*T).add(this.centerPos).add(ofstX*T, 0)
	}
	draw() {
		if (State.isStart) return
		Ctx.save()
		super.draw()
		this.sprite.draw(this)
		Ctx.restore()
	}
	update() {
		super.update()
		if (this.frozen || !State.isPlaying) return
		this.sprite.update(this)
		this.#notEaten++
		for (const _ of range(this.stepDiv))
			this.#behavior(this.stepDiv)
	}
	#behavior(divisor=1) {
		if (this.tileJustUpdated(divisor)) {
			this.#step = this.#getStep()
		}
		if (!this.#turning && this.collidedWithWall()) {
			this.#preDir  = null
			this.#stopped = true
			this.pos = this.tilePos.mul(T)
			return
		}
		this.#stopped = false
		this.#eaten(this)
		this.#setCornering(divisor)
		this.setNextPos(divisor)
		this.#endCornering()
		this.#turnAround()
	}
	#setCornering(divisor=1) {
		const dir = this.#preDir
		if (this.canTurn && dir) {
			this.#turning ||= true
			this.setNextPos(divisor,this.orient=dir)
		}
	}
	#endCornering() {
		if (this.#turning && this.inBackOfTile) {
			this.#preDir  = this.#nextDir
			this.#nextDir = null
			this.#turning = false
			this.setMoveDir(this.orient)
		}
	}
	#turnAround() {
		this.revOrient == this.dir
			&& this.setMoveDir(this.orient)
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
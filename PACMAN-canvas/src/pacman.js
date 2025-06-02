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

export const Player = function() {
	/** @type {PlayablePac} */
	let player
	$on({Title_Restart_NewLevel:()=> player=new PlayablePac})
	return new class extends Common {get i() {return player}}
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
	#nextTurn = /**@type {?Direction}*/(null)

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
		$offon('keydown.Player',this.#onKeydown.bind(this))
	}
	get canTurn() {
		return this.inFrontOfTile
			&& this.#preDir != null
			&& this.collidedWithWall(this.#preDir) === false
	}
	get baseSpeed() {
		return Game.moveSpeed
			* (Game.level<13 ? 1 : PacStep.SlowBase)
	}
	#getStep() {
		const eating = Maze.hasDot(this.tileIdx)
		return(GhsMgr.isFright
			? (eating? PacStep.EneEat : PacStep.Energize)
			: (eating? PacStep.Eating : PacStep.Base)
		) * this.baseSpeed
	}

	/** @param {KeyboardEvent} e */
	#allowKey(e) {
		const dir = Dir.from(e, {wasd:true})
		return (Confirm.opened
			|| keyRepeat(e)
			|| (dir == null)
			|| (dir == this.dir && !this.#turning)
		)? null : dir
	}

	/** @param {KeyboardEvent} e */
	#onKeydown(e) {
		const dir = this.#allowKey(e)
		if (!dir) return
		if (this.#turning) {
			this.#nextTurn = dir
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
			this.movDir = Dir.opposite(this.dir)
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
		if (State.isStart)
			return
		Ctx.save()
		super.draw()
		this.sprite.draw(this)
		Ctx.restore()
	}
	update() {
		super.update()
		if (Timer.frozen || !State.isPlaying)
			return
		this.sprite.update(this)
		this.#notEaten++
		for (let i=0,denom=ceil(this.step)*2; i<denom; i++)
			this.#behavior(denom)
	}
	#behavior(denom=1) {
		if (this.tileJustUpdated(denom)) {
			this.#step = this.#getStep()
		}
		if (!this.#turning && this.collidedWithWall()) {
			this.pos = this.tilePos.mul(T)
			this.#stopped = !(this.#preDir=null)
			return
		}
		this.#stopped = false
		this.#eaten(this)
		this.#setCornering(denom)
		this.setNextPos(denom)
		this.#endCornering()
		this.#turnAround()
	}
	#setCornering(denom=1) {
		if (this.canTurn) {
			this.#turning ||= true
			this.orient = nonNull(this.#preDir)
			this.setNextPos(denom,this.orient)
		}
	}
	#endCornering() {
		if (this.#turning && this.inBackOfTile) {
			this.movDir   = this.orient
			this.#preDir  = this.#nextTurn
			this.#turning = !!(this.#nextTurn=null)
		}
	}
	#turnAround() {
		Dir.opposite(this.orient) == this.dir
			&& (this.movDir = this.orient)
	}
	#eaten({tileIdx}=this) {
		if (!Maze.hasDot(tileIdx))
			return
		const isPow = Maze.hasPow(tileIdx)
		this.#playSE()
		this.resetTimer()
		Score.add(isPow? 50:10)
		isPow && GhsMgr.setFrightMode()
		Maze.clearBgDot(this) == 0
			? State.to('Clear')
			: Player.trigger('DotEaten',isPow)
	}
	#playSE() {
		const id = (this.#eatIdx ^= 1) ? 'eat1':'eat0'
		Sound.play(id, {duration:(T/this.step)*Ticker.Interval*0.5})
	}
}
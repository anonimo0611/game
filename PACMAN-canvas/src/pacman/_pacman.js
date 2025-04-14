import {Sound}   from '../../_snd/sound.js'
import {Confirm} from '../../_lib/confirm.js'
import {Game}    from '../_main.js'
import {State}   from '../state.js'
import {Ctrl}    from '../control.js'
import {Score}   from '../score.js'
import {Maze}    from '../maze.js'
import {Actor}   from '../actor.js'
import {GhsMgr}  from '../ghosts/_system.js'
import Sprite    from './pac_sprite.js'

export const Player = function() {
	/** @type {?PlayablePacman} */
	let player = null
	$on('Title Restart NewLevel',
		()=> player = new PlayablePacman())
	return {
		get instance()   {return player},
		get sprite()     {return player.sprite},
		get dir()        {return player.dir},
		get pos()        {return player.pos},
		get centerPos()  {return player.centerPos},
		get forwardPos() {return player.forwardPos},
		/** @param {function} fn */
		bindDotEaten(fn) {
			isFun(fn) && $(Player).on('DotEaten',fn)
		},
	}
}()
export class Pacman extends Actor {
	radius = PacRadius
	sprite = new Sprite(Ctx)
	constructor() {super();freeze(this)}
}
class PlayablePacman extends Pacman {
	#step     = this.#getCurrentStep()
	#eatIdx   = 0
	#notEaten = 0
	#turning  = false
	#stopped  = true

	/** @type {?keyof DirEnum} */
	#preDir   = null
	#nextTurn = this.#preDir

	get closed()       {return State.isPlaying == false}
	get showCenter()   {return Ctrl.showGridLines}
	get step()         {return this.#step}
	get stopped()      {return this.#stopped}
	get turning()      {return this.#turning}
	get timeNotEaten() {return this.#notEaten * Game.interval}
	get translucent()  {return this.showCenter || Ctrl.invincible}
	get maxAlpha()     {return this.translucent? this.cheatAlpha : 1}

	constructor() {
		super()
		this.pos = Vec2(13.52, 24).mul(T)
		$offon('keydown.Player', e=> this.#onKeydown(e))
	}
	get #canTurn() {
		return this.inForwardOfTile
			&& this.#preDir
			&& this.collidedWithWall(this.#preDir) === false
	}
	get #baseSpeed() {
		return Game.moveSpeed
			* (Game.level<13 ? 1 : PacStep.SlowBase)
	}
	#getCurrentStep() {
		const eating = Maze.hasDot(this.tileIdx)
		return(GhsMgr.frightened
			? (eating? PacStep.EneEat : PacStep.Energize)
			: (eating? PacStep.Eating : PacStep.Base)
		) * this.#baseSpeed
	}
	#ignoreKeys(e, dir) {
		return Confirm.opened
			|| e.originalEvent.repeat
			|| (dir == null)
			|| (dir == this.dir && !this.turning)
	}
	#onKeydown(e) {
		const dir = Dir.from(e, {wasd:true})
		if (this.#ignoreKeys(e, dir)) return
		if (this.turning) {
			this.#nextTurn = dir
			return
		}
		if (this.hasAdjWall(dir)) {
			this.#preDir = dir
			return
		}
		if (State.isSt_Ready && Vec2(dir).x || this.#stopped) {
			[this.#preDir,this.dir] = [null,dir]
			return
		}
		this.#preDir = dir
		if (this.inBackwardOfTile) {
			this.orient = dir
			this.movDir = Dir.opp.get(this.dir)
		}
	}
	resetTimer() {
		this.#notEaten = 0
	}
	forwardPos(num=0) {
		const  ofstX = (this.dir == Dir.Up ? -num : 0)
		return Vec2(this.dir).mul(num*T).add(this.centerPos).add(ofstX*T, 0)
	}
	update() {
		super.update()
		if (Timer.frozen || !State.isPlaying) return
		this.sprite.update(this)
		this.#notEaten++
		for (let i=0,denom=ceil(this.step)*2; i<denom; i++)
			this.#behavior(denom)
	}
	draw() {
		if (State.isStart) return
		Ctx.save()
		super.draw()
		this.sprite.draw(this)
		Ctx.restore()
	}
	#behavior(denom=1) {
		if (this.newTileReached(denom)) {
			this.#step = this.#getCurrentStep()
		}
		if (!this.turning && this.collidedWithWall()) {
			this.pos = this.tilePos.mul(T)
			this.#preDir  = null
			this.#stopped = true
			return
		}
		this.#stopped = false
		this.#eaten(this.tileIdx)
		this.#setCornering(denom)
		this.setNextPos(denom)
		this.#endCornering()
		this.#turnAround()
	}
	#setCornering(denom=1) {
		if (!this.#canTurn) return
		this.orient = this.#preDir
		this.#turning ||= true
		this.setNextPos(denom,this.orient)
	}
	#endCornering() {
		if (this.turning && this.inBackwardOfTile) {
			this.movDir   = this.orient
			this.#preDir  = this.#nextTurn
			this.#turning = !!(this.#nextTurn=null)
		}
	}
	#turnAround() {
		Dir.opp.get(this.orient) == this.dir
			&& (this.movDir = this.orient)
	}
	#eaten(idx) {
		if (!Maze.hasDot(idx)) return
		const isPow = Maze.hasPow(idx)
		this.#playSE()
		this.resetTimer()
		Score.add(isPow? 50:10)
		isPow && GhsMgr.setFrightMode()
		Maze.clearBgDot(this) == 0
			? State.switchToClear()
			: $(Player).trigger('DotEaten',isPow)
	}
	#playSE() {
		const duration = (T/this.step)*Ticker.Interval*0.5
		Sound.play(`eat${this.#eatIdx ^= 1}`, {duration})
	}
}
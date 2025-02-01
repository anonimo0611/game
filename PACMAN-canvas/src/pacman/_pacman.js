import {Sound}   from '../../_snd/sound.js'
import {Ticker}  from '../../_lib/timer.js'
import {Timer}   from '../../_lib/timer.js'
import {Vec2}    from '../../_lib/vec2.js'
import {Confirm} from '../../_lib/confirm.js'
import {Dir}     from '../../_lib/direction.js'
import {Ctx}     from '../_canvas.js'
import {Game}    from '../_main.js'
import {State}   from '../_state.js'
import {Ctrl}    from '../control.js'
import {Score}   from '../score.js'
import {Maze}    from '../maze.js'
import {Actor}   from '../actor.js'
import {GhsMgr}  from '../ghosts/_system.js'
import Sprite    from './pac_sprite.js'
import {PacRadius,PacStep as Step,TileSize as T} from '../_constants.js'

export const PacMgr = function() {
	/** @type {?Pacman} */
	let pacman = null
	const instantiate = ()=> pacman = new PlayablePacman()
	$on('Title Restart NewLevel', ()=> instantiate())
	return {
		get instance()   {return pacman ||= instantiate()},
		get dir()        {return pacman.dir},
		get pos()        {return pacman.pos},
		get centerPos()  {return pacman.centerPos},
		get forwardPos() {return pacman.forwardPos},
		bindDotEaten(fn) {$(PacMgr).on('DotEaten',fn)},
	}
}()
export class Pacman extends Actor {
	radius = PacRadius
	sprite = new Sprite()
	constructor() {super();freeze(this)}
}
class PlayablePacman extends Pacman {
	#step     = this.#getCurrentStep()
	#eatIdx   = 0
	#notEaten = 0
	#turning  = false
	#stopped  = true
	#preDir   = null
	#nextTurn = null
	get radius()       {return PacRadius}
	get closed()       {return State.isPlaying == false}
	get centerDot()    {return Ctrl.showGridLines}
	get step()         {return this.#step}
	get stopped()      {return this.#stopped}
	get turning()      {return this.#turning}
	get timeNotEaten() {return this.#notEaten * Game.interval}
	get translucent()  {return this.showCenter || Ctrl.invincible}
	get maxAlpha()     {return this.translucent? this.cheatAlpha : 1}

	constructor() {
		super()
		this.dir = Dir.Left
		this.pos = Vec2(13.5, 24).mul(T)
		$offon('keydown.Pacman', e=> this.#onKeydown(e))
	}
	get #canTurn() {
		return this.inForwardOfTile
			&& this.#preDir
			&& this.collidedWithWall(this.#preDir) == false
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
			this.movDir = Dir.opposite(this.dir)
		}
	}
	resetTimer() {
		this.#notEaten = 0
	}
	forwardPos(num=0) {
		const  ofstX = (this.dir == Dir.Up ? -num : 0)
		return Vec2(this.dir).mul(num*T).add(this.centerPos).add(ofstX*T, 0)
	}
	#getCurrentStep() {
		const eating = Maze.hasDot(this.tileIdx)
		return(!GhsMgr.frightened
			? (eating? Step.Eating : Step.Base)
			: (eating? Step.EneEat : Step.Energize)
		) * Game.moveSpeed * (Game.level<13 ? 1 : Step.SlowBase)
	}
	draw() {
		if (State.isStart) return
		Ctx.save()
		super.draw()
		this.sprite.draw(Ctx,this)
		Ctx.restore()
	}
	update() {
		super.update()
		if (Timer.frozen || !State.isPlaying) return
		this.sprite.update(this)
		this.#notEaten++
		for (let i=0,denom=ceil(this.step)*2; i<denom; i++)
			this.#move(denom)
	}
	#move(denom=1) {
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
		this.pos = this.setNextPos(denom,this.orient)
	}
	#endCornering() {
		if (this.turning && this.inBackwardOfTile) {
			this.movDir   = this.orient
			this.#preDir  = this.#nextTurn
			this.#turning = !!(this.#nextTurn=null)
		}
	}
	#turnAround() {
		Dir.isOpposite(this.orient, this.dir)
			&& (this.movDir = this.orient)
	}
	#eaten(idx) {
		if (!Maze.hasDot(idx)) return
		const isPow = Maze.hasPow(idx)
		this.#notEaten = 0
		this.#playSE()
		Score.add(isPow? 50:10)
		Maze.clearDot(this) == 0
			&& Sound.stopLoops()
			&& State.switchToClear()
			&& State.switchToFlashMaze({delay:1000})
		$(PacMgr).trigger('DotEaten', isPow)
	}
	#playSE() {
		const duration = (T/this.step)*Ticker.Interval*0.5
		Sound.play(`eat${this.#eatIdx ^= 1}`, {duration})
	}
}

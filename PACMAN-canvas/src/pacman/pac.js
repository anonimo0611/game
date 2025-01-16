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
import {Ghost}   from '../ghosts/ghost.js'
import Sprite    from './pac_sprite.js'
import {PacRadius,PacStep as Step,TileSize as T} from '../_constants.js'

export class Pacman extends Actor {
	static #symbol = Symbol()
	static #pacman = null
	static get instance()  {return this.#pacman ||= this.#instantiate()}
	static get dir()       {return this.instance.dir}
	static get pos()       {return this.instance.pos}
	static get centerPos() {return this.instance.centerPos}
	static forwardPos(num) {return this.instance.forwardPos(num)}
	static #instantiate()  {return new Pacman(this.#symbol)}
	static {
		$on('keydown', e=> this.instance.#onKeydown(e))
		$on('Title Respawn', ()=> this.#instantiate())
	}
	Radius    = PacRadius
	sprite    = new Sprite(this)
	#step     = this.#getCurrentStep()
	#eatIdx   = 0
	#notEaten = 0
	#turning  = false
	#stopped  = true
	#preDir   = null
	#nextTurn = null

	get step()         {return this.#step}
	get stopped()      {return this.#stopped}
	get turning()      {return this.#turning}
	get timeNotEaten() {return this.#notEaten * Game.interval}
	get showCenter()   {return Ctrl.showGridLines}
	get translucent()  {return this.showCenter || Ctrl.invincible}
	get maxAlpha()     {return this.translucent? this.cheatAlpha : 1}
	get mouthClosed()   {return State.isPlaying == false}

	get #canTurn() {
		return this.inForwardOfTile
			&& this.#preDir
			&& this.collidedWithWall(this.#preDir) == false
	}
	constructor(symbol) {
		if (symbol != Pacman.#symbol)
			throw TypeError('The constructor is not visible')
		super()
		this.dir = Dir.Left
		this.pos = Vec2(13.5, 24).mul(T)
		Pacman.#pacman = freeze(this)
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

		if (State.isStandby && Vec2(dir).x)
			return void ([this.#preDir,this.dir]=[null,dir])

		if (this.turning)
			return void (this.#nextTurn = dir)

		if (this.hasAdjWall(dir))
			return void (this.#preDir = dir)

		if (this.#stopped)
			return void ([this.#preDir,this.dir]=[null,dir])

		this.#preDir = dir
		if (this.inBackwardOfTile)
			this.movDir = Dir.opposite(this.dir)
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
		return(!Ghost.frightened
			? (eating? Step.Eating : Step.Base)
			: (eating? Step.EneEat : Step.Energize)
		) * Game.moveSpeed * (Game.level<13 ? 1 : Step.SlowBase)
	}
	draw() {
		if (State.isStart || Timer.frozen) return
		Ctx.save()
		super.draw()
		this.sprite.draw(Ctx, this.centerPos)
		Ctx.restore()
	}
	update() {
		super.update()
		if (Timer.frozen || !State.isPlaying) return
		this.sprite.update()
		this.#notEaten++
		for (let i=0,denom=ceil(this.step); i<denom; i++)
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
		this.pos = this.setNextPos(denom, this.orient)
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
		Maze.clearDot(this)
		Maze.dotsLeft == 0
			&& Sound.stopLoops()
			&& State.switchToClear()
			&& State.switchToFlashMaze(1000)
		$trigger('DotEaten', isPow)
	}
	#playSE() {
		const duration = (T/this.step)*Ticker.Interval*0.5
		Sound.play(`eat${this.#eatIdx ^= 1}`, {duration})
	}
}
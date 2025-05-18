import {Common} from '../_lib/common.js'
import {State}  from './state.js'
import {Maze}   from './maze.js'

const CW = CvsW
export class Actor extends Common {
	#x = 0
	#y = 0
	radius  = T
	#fadeIn = /**@type {?FadeIn}*/(null)
	#orient = /**@type {Direction}*/(L)
	#movDir = /**@type {Direction}*/(L)

	constructor()   {super()}
	get x()         {return this.#x}
	get y()         {return this.#y}
	get pos()       {return Vec2(this)}
	get centerPos() {return Vec2(this).add(T/2)}
	get tilePos()   {return Vec2(this).add(T/2).divInt(T)}
	get tileIdx()   {return Vec2.idx(this.tilePos,Cols)}
	set x(num)      {this.#x = num}
	set y(num)      {this.#y = num}
	set pos(pos)    {this.setPos(pos)}

	get dir()       {return this.#movDir}
	get movDir()    {return this.#movDir}
	get orient()    {return this.#orient}
	set dir(dir)    {this.#movDir = this.orient = dir}
	set movDir(dir) {this.#movDir = dir}
	set orient(dir) {this.#orient = dir}

	get step()       {return 0}
	get maxAlpha()   {return 1}
	get frozen()     {return Timer.frozen}
	get isInTunnel() {return Maze.Tunnel.isIn(this.centerPos)}

	get tilePixel() {
		const  {x,y} = this.centerPos, v = Vec2[this.dir]
		const  count = v.x? x % T : y % T
		return (v.x || v.y) > 0 ? count : T-count
	}
	get inFrontOfTile() {return this.tilePixel <= T/2}
	get inBackOfTile()  {return this.tilePixel >  T/2}

	update() {
		const {maxAlpha:maxA}= this
		State.isReady   && (this.#fadeIn ||= new FadeIn(500))?.update(maxA)
		State.isPlaying && (this.#fadeIn &&= null)
	}
	draw() {
		State.isReady && this.#fadeIn?.setAlpha(Ctx)
			|| (Ctx.globalAlpha = this.maxAlpha)
	}
	newTileReached(denom=1) {
		return this.inFrontOfTile
			&& this.tilePixel <= this.step/denom
	}
	collidedWithWall(dir=this.dir) {
		const  {step,centerPos}= this
		const  {x,y}= Vec2[dir].mul(T/2+step).add(centerPos).divInt(T)
		return Maze.hasWall({x:(x+Cols) % Cols, y})
	}
	centering() {
		this.x = (CvsW-T)/2
	}
	setPos({x=this.x, y=this.y}={}) {
		this.#y = y
		this.#x = function(r) {
			if (!State.isPlaying) return
			if (x < -r-T/2) return CW+T/2
			if (x > CW+T/2) return -r-T/2
		}(this.radius) ?? x
	}
	setNextPos(denom=1, dir=this.dir) {
		this.pos = Vec2[dir].mul(this.step/denom).add(this)
	}

	/** @param {Direction} dir */
	move(dir) {
		this.setNextPos(1, this.dir=dir)
	}

	/** @param {Direction} dir */
	hasAdjWall(dir) {
		return Maze.hasWall(this.getAdjTile(dir))
	}

	/** @param {Direction} dir */
	getAdjTile(dir, n=1, tile=this.tilePos) {
		const  v = Vec2[dir].mul(n).add(tile)
		return v.setX((v.x+Cols) % Cols)
	}
}
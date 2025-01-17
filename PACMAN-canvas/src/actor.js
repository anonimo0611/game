import {Vec2}   from '../_lib/vec2.js'
import {Dir,L}  from '../_lib/direction.js'
import {Ctx}    from './_canvas.js'
import {State}  from './_state.js'
import {Maze}   from './maze.js'
import {ColMax} from './_constants.js'
import {CvsWidth as CW,TileSize as T} from './_constants.js'

export class Actor {
	#x = 0
	#y = 0
	#orient = L
	#movDir = L
	#fadeIn = new FadeIn(500)

	get x()         {return this.#x}
	get y()         {return this.#y}
	get Radius()    {return T}
	get pos()       {return Vec2(this)}
	get centerPos() {return Vec2(this).add(T/2)}
	get tilePos()   {return Vec2(this.centerPos).divInt(T)}
	get tileIdx()   {return Vec2.idx(this.tilePos, ColMax)}
	set x(num)      {isNum(num) && (this.#x = num)}
	set y(num)      {isNum(num) && (this.#y = num)}
	set pos(pos)    {isObj(pos) && this.setPos(pos)}

	get dir()       {return this.#movDir}
	get movDir()    {return this.#movDir}
	get orient()    {return this.#orient}
	set dir(dir)    {Dir.isValid(dir) && (this.#movDir = this.orient = dir)}
	set movDir(dir) {Dir.isValid(dir) && (this.#movDir = dir)}
	set orient(dir) {Dir.isValid(dir) && (this.#orient = dir)}

	get step()       {return 0}
	get maxAlpha()   {return 1}
	get cheatAlpha() {return 0.75}
	get isInHouse()  {return Maze.isInHouse(this.tilePos)}
	get isInTunnel() {return Maze.Tunnel.isIn(this.centerPos)}

	get stepsPerTile() {
		if (!this.dir) return 0
		const {x,y} = this.centerPos, v = Vec2(this.dir)
		const count = v.x? x % T : y % T
		return (v.x || v.y) > 0 ? count : T-count
	}
	get inForwardOfTile()  {return this.stepsPerTile <= T/2}
	get inBackwardOfTile() {return this.stepsPerTile >  T/2}

	newTileReached(denom=1) {
		return this.inForwardOfTile && this.stepsPerTile <= this.step/denom
	}
	setPos({x=this.x, y=this.y}={}) {
		this.#y = y
		this.#x = function(r) {
			if (State.isPlaying && x < -r-T/2) return CW+T/2
			if (State.isPlaying && x > CW+T/2) return -r-T/2
		}(this.Radius) ?? x
	}
	setCenterX(x) {
		this.pos = Vec2(x-T/2, this.y)
	}
	setNextPos(denom=1, dir=this.dir) {
		this.pos = Vec2(dir).mul(this.step/denom).add(this)
	}
	hasAdjWall(dir) {
		return Maze.hasWall(this.getAdjTile(dir))
	}
	getAdjTile(dir, n=1, tile=this.tilePos) {
		const  v = Vec2(dir).mul(n).add(tile)
		return v.setX((v.x+ColMax) % ColMax)
	}
	collidedWithWall(dir=this.dir) {
		const {step,centerPos}= this
		const {x,y}= Vec2(dir).mul(T/2+step).add(centerPos).divInt(T)
		return Maze.hasWall({x:(x+ColMax) % ColMax, y})
	}
	update() {
		State.isReady && this.#fadeIn.update(this.maxAlpha)
	}
	draw() {
		Ctx.globalAlpha = this.maxAlpha
		State.isReady && this.#fadeIn.setAlpha(Ctx)
	}
}
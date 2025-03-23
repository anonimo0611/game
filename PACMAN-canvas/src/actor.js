import {State} from './_state.js'
import {Maze}  from './maze.js'

const CW = CvsW
export class Actor {
	#x = 0
	#y = 0
	#orient = L
	#movDir = L
	#fadeIn = new FadeIn(500)

	get x()         {return this.#x}
	get y()         {return this.#y}
	get radius()    {return T}
	get pos()       {return Vec2(this)}
	get centerPos() {return Vec2(this).add(T/2)}
	get tilePos()   {return Vec2(this.centerPos).divInt(T)}
	get tileIdx()   {return Vec2.idx(this.tilePos, Cols)}
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
	get frozen()     {return Timer.frozen}
	get isInHouse()  {return Maze.isInHouse(this.tilePos)}
	get isInTunnel() {return Maze.Tunnel.isIn(this.centerPos)}

	get stepsPerTile() {
		const  {x,y} = this.centerPos, v = Vec2(this.dir)
		const  count = v.x? x % T : y % T
		return (v.x || v.y) > 0 ? count : T-count
	}
	get inForwardOfTile()  {return this.stepsPerTile <= T/2}
	get inBackwardOfTile() {return this.stepsPerTile >  T/2}

	setX(x) {this.x = x}
	setY(y) {this.y = y}
	setPos({x=this.x, y=this.y}={}) {
		this.#y = y
		this.#x = function(r) {
			if (!State.isPlaying) return
			if (x < -r-T/2) return CW+T/2
			if (x > CW+T/2) return -r-T/2
		}(this.radius) ?? x
	}
	setCenterX(x) {
		this.pos = Vec2(x-T/2, this.y)
	}
	setNextPos(denom=1, dir=this.dir) {
		this.pos = Vec2(dir).mul(this.step/denom).add(this)
	}
	setMove(dir) {
		this.dir = dir
		this.setNextPos()
	}
	newTileReached(denom=1) {
		return this.inForwardOfTile && this.stepsPerTile <= this.step/denom
	}
	hasAdjWall(dir) {
		const  adjTile = this.getAdjTile(dir)
		return Maze.hasWall(adjTile)
	}
	getAdjTile(dir, n=1, tile=this.tilePos) {
		const  v = Vec2(dir).mul(n).add(tile)
		return v.setX((v.x+Cols) % Cols)
	}
	collidedWithWall(dir=this.dir) {
		const  {step,centerPos}= this
		const  {x,y}= Vec2(dir).mul(T/2+step).add(centerPos).divInt(T)
		return Maze.hasWall({x:(x+Cols) % Cols, y})
	}
	update() {
		State.isReady && this.#fadeIn.update(this.maxAlpha)
	}
	draw() {
		Ctx.globalAlpha = this.maxAlpha
		State.isReady && this.#fadeIn.setAlpha(Ctx)
	}
}
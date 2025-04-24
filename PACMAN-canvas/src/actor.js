import {State} from './state.js'
import {Maze}  from './maze.js'

const CW = CvsW
export class Actor {
	radius = T
	#x=0; #y=0; #fadeIn=new FadeIn(500)

	/** @type {keyof DirEnum} */
	#orient = L
	#movDir = this.#orient
	constructor(dir=L) {this.dir = dir}

	get x()         {return this.#x}
	get y()         {return this.#y}
	get pos()       {return Vec2(this)}
	get centerPos() {return Vec2(this).add(T/2)}
	get tilePos()   {return Vec2(this).add(T/2).divInt(T)}
	get tileIdx()   {return Vec2.idx(this.tilePos,Cols)}
	set x(num)      {isNum(num) && (this.#x = num)}
	set y(num)      {isNum(num) && (this.#y = num)}
	set pos(pos)    {isObj(pos) && this.setPos(pos)}

	get dir()       {return this.#movDir}
	get movDir()    {return this.#movDir}
	get orient()    {return this.#orient}
	set dir(dir)    {Dir.has(dir) && (this.#movDir = this.orient = dir)}
	set movDir(dir) {Dir.has(dir) && (this.#movDir = dir)}
	set orient(dir) {Dir.has(dir) && (this.#orient = dir)}

	get step()       {return 0}
	get maxAlpha()   {return 1}
	get cheatAlpha() {return 0.75}
	get frozen()     {return Timer.frozen}
	get isInHouse()  {return Maze.House .isIn(this.tilePos)}
	get isInTunnel() {return Maze.Tunnel.isIn(this.centerPos)}

	get moveAmountPerTile() {
		const  {x,y} = this.centerPos, v = Vec2(this.dir)
		const  count = v.x? x % T : y % T
		return (v.x || v.y) > 0 ? count : T-count
	}
	get inForwardOfTile()  {return this.moveAmountPerTile <= T/2}
	get inBackwardOfTile() {return this.moveAmountPerTile >  T/2}

	update() {
		State.isReady && this.#fadeIn.update(this.maxAlpha)
	}
	draw() {
		State.isReady && this.#fadeIn.setAlpha(Ctx)
			|| (Ctx.globalAlpha = this.maxAlpha)
	}
	newTileReached(denom=1) {
		return this.inForwardOfTile
			&& this.moveAmountPerTile <= this.step/denom
	}
	collidedWithWall(dir=this.dir) {
		const  {step,centerPos}= this
		const  {x,y}= Vec2(dir).mul(T/2+step).add(centerPos).divInt(T)
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
		this.pos = Vec2(dir).mul(this.step/denom).add(this)
	}

	/** @param {keyof DirEnum} dir */
	move(dir) {
		this.setNextPos(1, this.dir=dir)
	}

	/** @param {keyof DirEnum} dir */
	hasAdjWall(dir) {
		return Maze.hasWall(this.getAdjTile(dir))
	}

	/** @param {keyof DirEnum} dir */
	getAdjTile(dir, n=1, tile=this.tilePos) {
		const  v = Vec2(dir).mul(n).add(tile)
		return v.setX((v.x+Cols) % Cols)
	}

	/** @param {string} state */
	trigger(state) {
		$(this).trigger(state)
		return this
	}
	addHandler(...args) {
		$(this).on(...args)
		return this
	}
}
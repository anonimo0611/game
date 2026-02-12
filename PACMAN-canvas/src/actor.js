import {Dir}    from '../_lib/direction.js'
import {Maze}   from './maze.js'
import {Player} from './player/player.js'
import {GhsMgr} from './ghosts/_system.js'
import Sprite   from './sprites/pacman.js'
import {SpawnFader} from './actor_fader.js'

export class Actor {
	/** @readonly */
	static SpawnFader = SpawnFader

	pos = Vec2.Zero
	#orient = /**@type {Direction}*/(L)
	#movDir = /**@type {Direction}*/(L)

	/** @protected */
	constructor(col=0,row=0) {this.pos.set(col*T,row*T)}
	get speed()     {return 0}
	get radius()    {return T}
	get size()      {return this.radius*2}
	get inHouse()   {return Maze.House.isIn(this.tilePos)}
	get inTunSide() {return Maze.Tunnel.findSide(this.center)}

	get x()         {return this.pos.x}
	get y()         {return this.pos.y}
	set x(num)      {this.pos.x = num}
	set y(num)      {this.pos.y = num}

	get center()    {return this.pos.clone.add(T/2)}
	get tilePos()   {return this.center.divInt(T)}
	get tileMid()   {return this.tilePos.add(.5)}
	get tileIdx()   {return this.tilePos.toIdx(Cols)}

	get dir()       {return this.#movDir}
	get orient()    {return this.#orient}
	get revDir()    {return Dir.Opposite[this.dir]}
	get revOrient() {return Dir.Opposite[this.orient]}
	set dir(dir)    {this.#orient = this.#movDir = dir}
	set orient(dir) {this.#orient = dir}

	get tilePixel() {
		const  {x,y} = this.center, v = Vec2[this.dir]
		const  count = v.x? (x % T) : (y % T)
		return (v.x || v.y) > 0 ? count : T-count
	}
	get passedTileCenter() {
		return this.tilePixel > T/2
	}
	centering() {
		this.x = (BW-T)/2
	}
	#wrapXAxis() {
		this.x = function({x,size}) {
			if (x < -size)   return BW+size
			if (x > BW+size) return -size
			return x
		}(this)
	}
	#fixPosition() {
		Vec2[this.dir].y
			? (this.x = this.tilePos.x * T)
			: (this.y = this.tilePos.y * T)
	}
	move(dir=this.dir) {
		this.setNextPos(this.speed, this.dir=dir)
	}
	setNextPos(spd=this.speed, dir=this.dir) {
		this.pos = Vec2[dir].mul(spd).add(this)
		this.#wrapXAxis()
	}
	/** @param {Direction} dir */
	setMoveDir(dir) {
		this.#movDir = dir
		this.#fixPosition()
	}
	/** @param {Direction} dir */
	hasAdjWall(dir) {
		return Maze.hasWall( this.getAdjTile(dir) )
	}
	/** @param {Direction} dir */
	getAdjTile(dir, tile=this.tilePos) {
		const  v = Vec2[dir].add(tile)
		return v.setX((v.x+Cols) % Cols) // x-axis wrap
	}
	collidesWithWall(dir=this.dir) {
		const {x,y}= Vec2[dir].mul(T/2+1).add(this.center).divInt(T)
		return Maze.hasWall({x:(x+Cols) % Cols, y}) // x-axis wrap
	}
	justArrivedAtTile(spd=this.speed) {
		return !this.passedTileCenter && this.tilePixel <= spd
	}
	drawCenterDot({r=3,color='red'}={}) {
		Fg.fillCircle(...this.center.vals, r, color)
	}
}

export const Actors = new class {
	update() {
		Player.core.update()
		GhsMgr.update()
	}
	/** @param {PacMan} pacman */
	draw(pacman) {
		GhsMgr.drawBehind()
		pacman.draw()
		GhsMgr.drawFront()
	}
}

export class PacMan extends Actor {
	/** @readonly */
	sprite = new Sprite(Fg)
	constructor(col=0,row=0) {super(col,row)}
	get radius() {return PacRadius}
	get hidden() {return Timer.frozen}
	draw() {this.sprite.draw(this)}
}
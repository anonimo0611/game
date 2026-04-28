import {Dir}    from '../_lib/direction.js'
import {Maze}   from './maze.js'
import  PacSpr  from './sprites/pacman.js'
import {Ghosts} from './ghosts/_system.js'

export class Actor {
	pos = Vec2.Zero
	orient  = /**@type {Direction}*/(L)
	#movDir = this.orient

	/** @protected */
	constructor(col=0, row=0) {
		this.pos.set(col*T, row*T)
	}
	// Override the actual speed in the subclasses.
	get speed()     {return 0}
	get inHouse()   {return Maze.House.isIn(this.tile)}
	get inTunSide() {return Maze.Tunnel.findSide(this.center)}

	get x()         {return this.pos.x}
	get y()         {return this.pos.y}
	set x(num)      {this.pos.x = num}
	set y(num)      {this.pos.y = num}

	get center()    {return this.pos.clone.add(T/2)}
	get tile()      {return this.center.divInt(T)}
	get tileMid()   {return this.tile.add(.5)}
	get tileIdx()   {return this.tile.toIdx(Cols)}

	get dir()       {return this.#movDir}
	set dir(dir)    {this.#movDir = this.orient = dir}
	get revDir()    {return Dir.Opposite[this.dir]}
	get revOrient() {return Dir.Opposite[this.orient]}

	get tilePixel() {
    	const dot = this.center.dot(Vec2[this.dir])
    	return (dot % T + T) % T
	}
	get passedTileCenter() {
		return this.tilePixel > T/2
	}
	centering() {
		this.x = (BW-T)/2
	}
	keepInsideBoard() {
		const {center:{x}}= this
		this.x = clamp(x, T, BW-T) - T/2
	}
	#wrapXAxis() {
		this.x = function({center:{x}}) {
			if (x <   -T) return BW+T
			if (x > BW+T) return -T
			return x
		}(this) - T/2
	}
	#fixPosition() {
		Vec2[this.dir].y
			? (this.x = this.tile.x * T)
			: (this.y = this.tile.y * T)
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
	getAdjTile(dir, tile=this.tile) {
		return Vec2[dir].add(tile).wrapX(Cols)
	}
	collidesWithWall(dir=this.dir) {
		const  fwd = Vec2[dir].mul(T/2+1).add(this.center)
		return Maze.hasWall( fwd.divInt(T).wrapX(Cols) )
	}
	justArrivedAtTile(spd=this.speed) {
		return !this.passedTileCenter && this.tilePixel <= spd
	}
	drawCenterDot({r=3,color='red'}={}) {
		Fg.fillCircle(...this.center.vals, r, color)
	}
}

export const Actors = {
	/** @param {PacMan} pacman */
	update(pacman) {
		pacman.update()
		Ghosts.update()
	},
	/** @param {PacMan} pacman */
	draw(pacman) {
		Ghosts.drawBehind()
		pacman.draw()
		Ghosts.drawFront()
	},
}

export class PacMan extends Actor {
	/** @readonly */
	sprite = new PacSpr(Fg,T)
	constructor(col=0, row=0) {
		super(col, row)
	}
	get hidden() {
		return Timer.frozen
	}
	update() {
		this.sprite.update(this)
	}
	draw() {
		this.sprite.draw(this)
	}
}
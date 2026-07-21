import {Dir}  from '../_lib/direction.js'
import {Maze} from './maze.js'

export class Actor {
	/** @readonly */
	static CHEAT_ALPHA = 0.75

	pos = Vec2.Zero
	orient  = /**@type {Direction}*/(L)
	#movDir = this.orient

	/** @protected */
	fadeSpr = /**@type {?Fade}*/(null)

	/** @protected */
	constructor(col=0, row=0) {this.pos.set(col*T, row*T)}

	// Override the actual speed in the subclasses.
	get speed()     {return 0}
	get maxAlpha()  {return 1}
	get alpha()     {return this.fadeSpr?.alpha ?? this.maxAlpha}
	get inHouse()   {return Maze.House.isIn(this.tile)}
	get inTunSide() {return Maze.Tunnel.findSide(this.center)}

	get x()         {return this.pos.x}
	get y()         {return this.pos.y}
	set x(num)      {this.pos.x = num}
	set y(num)      {this.pos.y = num}

	get center()    {return this.pos.clone.add(T/2)}
	get tile()      {return this.center.divInt(T)}
	get tileIdx()   {return this.tile.toIdx(COLS)}

	get dir()       {return this.#movDir}
	set dir(dir)    {this.#movDir = this.orient = dir}

	get aligned()   {return this.dir == this.orient}
	get revDir()    {return Dir.Opposite[this.dir]}
	get revOrient() {return Dir.Opposite[this.orient]}

	get tilePixel() {
		const dot = this.center.dot(Vec2[this.dir])
		return (dot % T + T) % T
	}
	get passedTileCenter() {
		return this.tilePixel > T/2
	}
	/** @protected */
	drawCenterDot({r=3,color='red'}={}) {
		Fg.fillCircle(...this.center.vals, r, color)
	}
	centering() {
		this.x = (BW-T)/2
	}
	keepInsideBoard() {
		const {center:{x}}= this
		this.x = mathClamp(x, T, BW-T) - T/2
	}
	#snapToAxis() {
		Vec2[this.dir].y
			? (this.x = this.tile.x * T)
			: (this.y = this.tile.y * T)
	}
	snapToTileCenter() {
		this.pos = this.tile.mul(T)
	}
	#wrapXAxis() {
		this.x = function({center:{x}}) {
			if (x <   -T) return BW+T
			if (x > BW+T) return -T
			return x
		}(this) - T/2
	}
	move(dir=this.dir) {
		this.setNextPosition(this.speed, this.dir=dir)
	}
	alignDirection(dir=this.orient) {
		this.#movDir = dir
		this.#snapToAxis()
	}
	setNextPosition(speed=this.speed, dir=this.dir) {
		this.pos = Vec2[dir].mul(speed).add(this)
		this.#wrapXAxis()
	}
	justArrivedAtTile(speed=this.speed) {
		return this.passedTileCenter == false
			&& this.tilePixel <= speed
	}
	/** @param {Direction} dir */
	forward(dir, dist=0) {
    	return Vec2[dir].mul(dist).add(this.center)
	}
	/** @param {Direction} dir */
	getAdjacentTile(dir, tile=this.tile) {
		return Vec2[dir].add(tile).wrapX(COLS)
	}
	/** @param {Direction} dir */
	hasAdjacentWall(dir) {
		return Maze.hasWall( this.getAdjacentTile(dir) )
	}
	/** @param {?Direction} [dir] */
	collidesWithWall(dir=this.dir) {
		if (dir === null) return false
		const  tile = this.forward(dir,T/2+1e-6).divInt(T)
		return Maze.hasWall( tile.wrapX(COLS) )
	}
}
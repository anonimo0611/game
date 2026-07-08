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
	constructor(col=0, row=0) {
		this.pos.set(col*T, row*T)
	}
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
	get tileMid()   {return this.tile.add(.5)}
	get tileIdx()   {return this.tile.toIdx(COLS)}

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
		this.x = mathClamp(x, T, BW-T) - T/2
	}
	#fixPosition() {
		Vec2[this.dir].y
			? (this.x = this.tile.x * T)
			: (this.y = this.tile.y * T)
	}
	#wrapXAxis() {
		this.x = function({center:{x}}) {
			if (x <   -T) return BW+T
			if (x > BW+T) return -T
			return x
		}(this) - T/2
	}
	updateDirection(dir=this.orient) {
		this.#movDir = dir
		this.#fixPosition()
	}
	setNextPosition(spd=this.speed, dir=this.dir) {
		this.pos = Vec2[dir].mul(spd).add(this)
		this.#wrapXAxis()
	}
	move(dir=this.dir) {
		this.setNextPosition(this.speed, this.dir=dir)
	}
	forward(dir=this.dir, dist=T/2+1e-6) {
    	return Vec2[dir].mul(dist).add(this.center)
	}
	getAdjacentTile(dir=this.dir, tile=this.tile) {
		return Vec2[dir].add(tile).wrapX(COLS)
	}
	hasAdjacentWall(dir=this.orient) {
		return Maze.hasWall( this.getAdjacentTile(dir) )
	}
	collidesWithWall(dir=this.orient) {
		return Maze.hasWall( this.forward(dir).divInt(T).wrapX(COLS) )
	}
	justArrivedAtTile(spd=this.speed) {
		return !this.passedTileCenter && this.tilePixel <= spd
	}
	drawCenterDot({r=3,color='red'}={}) {
		Fg.fillCircle(...this.center.vals, r, color)
	}
}
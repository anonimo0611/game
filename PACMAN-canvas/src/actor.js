import {Dir}  from '@lib/direction.js'
import {Maze} from '@/maze.js'

export class Actor {
	/** @readonly */
	static CHEAT_ALPHA = 0.75

	pos = Vec2.Zero
	orient  = DirL
	#movDir = DirL
	#fader  = Fade.NULL

	/** @protected */
	constructor(col=0, row=0, dir=this.dir) {
		this.dir = dir
		this.pos.set(col*TS, row*TS)
	}

	// Override the actual speed and maxAlpha in the subclasses.
	get speed()      {return 0}
	get maxAlpha()   {return 1}
	get alpha()      {return this.#fader?.alpha ?? this.maxAlpha}

	get x()          {return this.pos.x}
	get y()          {return this.pos.y}
	set x(num)       {this.pos.x = num}
	set y(num)       {this.pos.y = num}

	get center()     {return this.pos.clone.add(TS/2)}
	get tile()       {return this.center.divInt(TS)}

	get dir()        {return this.#movDir}
	set dir(dir)     {this.#movDir = this.orient = dir}

	get dirAligned() {return this.dir == this.orient}
	get revDir()     {return Dir.Opposite[this.dir]}
	get revOrient()  {return Dir.Opposite[this.orient]}
	get inHouse()    {return Maze.House.isIn(this.tile)}
	get inTunSide()  {return Maze.Tunnel.findSide(this.center)}

	get tilePixel() {
		const dot = this.center.dot(Vec2[this.dir])
		return (dot % TS + TS) % TS
	}
	get passedTileCenter() {
		return this.tilePixel > TS/2
	}

	fadeIn (ms=500) {this.#fader = Fade.in (ms)}
	fadeOut(ms=500) {this.#fader = Fade.out(ms)}
	updateFade() {this.#fader?.update(this.maxAlpha)}

	/** @protected */
	drawCenterDot({r=3, color='red'}={}) {
		Fg.fillCircle(...this.center.vals, r, color)
	}

	centering() {
		this.x = (BW-TS)/2
	}
	keepInsideBoard() {
		this.x = clamp(this.center.x, TS, BW-TS) - TS/2
	}

	snapToTileCenter() {
		this.pos = this.tile.mul(TS)
	}
	snapToAxis(dir=this.dir) {
		Vec2[dir].y
			? (this.x = this.tile.x * TS)
			: (this.y = this.tile.y * TS)
		return this
	}
	#wrapXAxis() {
		this.x = function({center:{x}}) {
			if (x <   -TS) return BW+TS
			if (x > BW+TS) return -TS
			return x
		}(this) - TS/2
	}

	/** @param {Direction} dir */
	setMoveDir(dir) {
		this.#movDir = dir
	}
	alignDir() {
		this.#movDir = this.orient
		this.snapToAxis()
	}

	move(dir=this.dir) {
		this.setNextPos(this.speed, this.dir=dir)
	}
	setNextPos(speed=this.speed, dir=this.dir) {
		this.pos = Vec2[dir].mul(speed).add(this)
		this.#wrapXAxis()
	}

	justArrivedAtTile(speed=this.speed) {
		return !this.passedTileCenter && this.tilePixel <= speed
	}

	/** @param {Direction} dir */
	forward(dir, dist=0) {
    	return Vec2[dir].mul(dist).add(this.center)
	}

	/** @param {Direction} dir */
	getAdjTile(dir, tile=this.tile) {
		return Vec2[dir].add(tile).wrapX(COLS)
	}

	/** @param {Direction} dir */
	hasAdjWall(dir) {
		return Maze.hasWall( this.getAdjTile(dir) )
	}

	collidesWithWall(dir=this.dir) {
		const  fwdTile = this.forward(dir,TS/2+1e-6).divInt(TS)
		return Maze.hasWall( fwdTile.wrapX(COLS) )
	}
}
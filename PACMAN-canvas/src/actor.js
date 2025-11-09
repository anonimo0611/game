import {Common} from '../_lib/common.js'
import {Dir}    from '../_lib/direction.js'
import {State}  from './state.js'
import {Maze}   from './maze.js'
import {Player} from './player/pacman.js'
import {GhsMgr} from './ghosts/_system.js'

export class Actor extends Common {
	pos = Vec2()
	#fadeIn = /**@type {?FadeIn}*/(null)
	#orient = /**@type {Direction}*/(L)
	#movDir = /**@type {Direction}*/(L)

	/** @protected */
	constructor()   {super()}
	get radius()    {return T}
	get maxAlpha()  {return 1}
	get step()      {return 0}
	get inHouse()   {return Maze.House.isIn(this.tilePos)}
	get inTunnel()  {return Maze.Tunnel.wicthSide(this.center)}

	get x()         {return this.pos.x}
	get y()         {return this.pos.y}
	set x(num)      {this.pos.x = num}
	set y(num)      {this.pos.y = num}

	get center()    {return this.pos.clone.add(T/2)}
	get tilePos()   {return this.pos.clone.add(T/2).divInt(T)}
	get tileIdx()   {return Vec2.idx(this.tilePos,Cols)}

	get dir()       {return this.#movDir}
	get orient()    {return this.#orient}
	get revDir()    {return Dir.Opposite[this.dir]}
	get revOrient() {return Dir.Opposite[this.orient]}
	set dir(dir)    {this.#movDir = this.orient = dir}
	set orient(dir) {this.#orient = dir}

	get tilePixel() {
		const  {x,y} = this.center, v = Vec2[this.dir]
		const  count = v.x? x % T : y % T
		return (v.x || v.y) > 0 ? count : T-count
	}
	get tileCenterReached() {
		return this.tilePixel > T/2
	}

	static update() {
		Player.update()
		GhsMgr.update()
	}
	static draw() {
		GhsMgr.drawBehind()
		Player.draw()
		GhsMgr.drawFront()
	}
	updateFadeIn(maxA=this.maxAlpha) {
		State.isReady   && (this.#fadeIn ||= new FadeIn)?.update(maxA)
		State.isPlaying && (this.#fadeIn &&= null)
	}
	setFadeInAlpha() {
		Ctx.setAlpha(this.#fadeIn?.alpha ?? this.maxAlpha)
	}
	/** @param {Cvs2DStyle} color */
	drawCenter(color, isVisible=true) {
		const {x,y}= this.center
		isVisible && Ctx.fillCircle(x,y, 3, color)
	}
	/** @param {number} divisor */
	setNextPos(divisor, dir=this.dir) {
		this.pos = Vec2[dir].mul(this.step/divisor).add(this)
		this.xAxisLoops()
	}
	justArrivedAtTile(divisor=1) {
		return this.tileCenterReached === false
			&& this.tilePixel <= this.step/divisor
	}
	xAxisLoops() {
		this.x = function({x,radius:r}) {
			if (x < -r-T/2) return BW+T/2
			if (x > BW+T/2) return -r-T/2
		}(this) ?? this.x
	}
	centering() {this.x = (BW-T)/2}

	/** @param {Direction} dir */
	setMoveDir(dir) {this.#movDir = dir}

	/** @param {Direction} dir */
	move(dir) {this.setNextPos(1, this.dir=dir)}

	/** @param {Direction} dir */
	hasAdjWall(dir) {
		return Maze.hasWall(this.getAdjTile(dir))
	}
	/** @param {Direction} dir */
	getAdjTile(dir, tile=this.tilePos) {
		const  v = Vec2[dir].add(tile)
		return v.setX((v.x+Cols) % Cols) // x-axis loops
	}
	/** @param {Direction} dir */
	collidedWithWall(dir=this.dir) {
		const {step,center}= this
		const {x,y}= Vec2[dir].mul(T/2+step).add(center).divInt(T)
		return Maze.hasWall({x:(x+Cols) % Cols, y}) // x-axis loops
	}
}
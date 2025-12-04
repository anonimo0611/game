import {Common} from '../_lib/common.js'
import {Dir}    from '../_lib/direction.js'
import {State}  from './state.js'
import {Maze}   from './maze.js'
import {Player} from './player/player.js'
import {GhsMgr} from './ghosts/_system.js'

class SpawnFadeIn {
	#fadeIn = /**@type {?FadeIn}*/(new FadeIn)
	setAlpha(max=1) {
		!State.isReady
			? Ctx.setAlpha(max)
			: Ctx.setAlpha(this.#fadeIn?.alpha)
	}
	update(max=1) {
		State.isReady  && this.#fadeIn?.update(max)
		State.isInGame &&(this.#fadeIn &&= null)
	}
}
export class Actor extends Common {
	/** @readonly */
	static SpawnFadeIn = SpawnFadeIn
	static update() {
		Player.update()
		GhsMgr.update()
	}
	static draw() {
		GhsMgr.drawBehind()
		Player.draw()
		GhsMgr.drawFront()
	}
	pos = Vec2.Zero
	#orient = /**@type {Direction}*/(L)
	#movDir = /**@type {Direction}*/(L)

	/** @protected */
	constructor()   {super()}
	get radius()    {return T}
	get maxAlpha()  {return 1}
	get speed()     {return 0}
	get inHouse()   {return Maze.House.isIn(this.tilePos)}
	get inTunSide() {return Maze.Tunnel.findSide(this.center)}

	get x()         {return this.pos.x}
	get y()         {return this.pos.y}
	set x(num)      {this.pos.x = num}
	set y(num)      {this.pos.y = num}

	get center()    {return this.pos.clone.add(T/2)}
	get tilePos()   {return this.center.divInt(T)}
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
	drawCenterDot(color='#F00') {
		const {x,y}= this.center
		Ctx.fillCircle(x,y, 3, color)
	}
	centering() {
		this.x = (BW-T)/2
	}
	setNextPos(divisor=1, dir=this.dir) {
		this.pos = Vec2[dir].mul(this.speed/divisor).add(this)
		this.wrapXAxis()
	}
	justArrivedAtTile(divisor=1) {
		return this.passedTileCenter == false
			&& this.tilePixel <= this.speed/divisor
	}
	wrapXAxis() {
		this.x = function({x,radius:r}) {
			if (x < -r-T/2) return BW+T/2
			if (x > BW+T/2) return -r-T/2
		}(this) ?? this.x
	}
	move(dir=this.dir) {
		this.setNextPos(1, this.dir=dir)
	}
	setMoveDir(/**@type {Direction}*/dir) {
		this.#movDir = dir
	}
	hasAdjWall(/**@type {Direction}*/dir) {
		return Maze.hasWall(this.getAdjTile(dir))
	}
	getAdjTile(/**@type {Direction}*/dir, tile=this.tilePos) {
		const  v = Vec2[dir].add(tile)
		return v.setX((v.x+Cols) % Cols) // x-axis wrap
	}
	collidesWithWall(dir=this.dir) {
		const {speed,center}= this
		const {x,y}= Vec2[dir].mul(T/2+speed).add(center).divInt(T)
		return Maze.hasWall({x:(x+Cols) % Cols, y}) // x-axis wrap
	}
}
import {Common} from '../_lib/common.js'
import {Dir}    from '../_lib/direction.js'
import {State}  from './state.js'
import {Maze}   from './maze.js'
import {Player} from './player/player.js'
import {GhsMgr} from './ghosts/_system.js'

class SpawnFade {
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
	static SpawnFade = SpawnFade
	static update() {
		Player.update()
		GhsMgr.update()
	}
	/** @param {{draw:()=>void}} player */
	static draw(player) {
		GhsMgr.drawBehind()
		player.draw()
		GhsMgr.drawFront()
	}
	/** @param {Vec2} pos */
	static drawCenterDot({x,y}, color='red') {
		Ctx.fillCircle(x,y, 3, color)
	}
	pos = Vec2.Zero
	#orient = /**@type {Direction}*/(L)
	#movDir = /**@type {Direction}*/(L)

	/** @protected */
	constructor()   {super()}
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
	move(dir=this.dir) {
		this.setNextPos(this.speed, this.dir=dir)
	}
	setNextPos(spd=this.speed, dir=this.dir) {
		this.pos = Vec2[dir].mul(spd).add(this)
		this.wrapXAxis()
	}
	wrapXAxis() {
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
	setMoveDir(/**@type {Direction}*/dir) {
		this.#movDir = dir
		this.#fixPosition()
	}
	hasAdjWall(/**@type {Direction}*/dir) {
		return Maze.hasWall( this.getAdjTile(dir) )
	}
	getAdjTile(/**@type {Direction}*/dir, tile=this.tilePos) {
		const  v = Vec2[dir].add(tile)
		return v.setX((v.x+Cols) % Cols) // x-axis wrap
	}
	justArrivedAtTile(spd=this.speed) {
		return this.passedTileCenter == false
			&& this.tilePixel <= spd
	}
	collidesWithWall(dir=this.dir) {
		const {speed,center}= this
		const {x,y}= Vec2[dir].mul(T/2+speed).add(center).divInt(T)
		return Maze.hasWall({x:(x+Cols) % Cols, y}) // x-axis wrap
	}
}
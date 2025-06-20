import {Common} from '../_lib/common.js'
import {Dir}    from '../_lib/direction.js'
import {State}  from './state.js'
import {Maze}   from './maze.js'
import {Player} from './pacman.js'
import {GhsMgr} from './ghosts/_system.js'

export class Actor extends Common {
	#x = 0
	#y = 0
	radius  = T
	stepDiv = 10
	#fadeIn = /**@type {?FadeIn}*/(null)
	#orient = /**@type {Direction}*/(L)
	#movDir = /**@type {Direction}*/(L)

	/** @protected */
	constructor()   {super()}
	get x()         {return this.#x}
	get y()         {return this.#y}
	get pos()       {return Vec2(this)}
	get centerPos() {return Vec2(this).add(T/2)}
	get tilePos()   {return Vec2(this).add(T/2).divInt(T)}
	get tileIdx()   {return Vec2.idx(this.tilePos,Cols)}
	set x(num)      {this.#x = num}
	set y(num)      {this.#y = num}
	set pos(pos)    {this.setPos(pos)}

	get dir()       {return this.#movDir}
	get orient()    {return this.#orient}
	get revDir()    {return Dir.opposite(this.dir)}
	get revOrient() {return Dir.opposite(this.orient)}
	set dir(dir)    {this.#movDir = this.orient = dir}
	set orient(dir) {this.#orient = dir}

	/** @param {Direction} dir */
	setMoveDir(dir) {this.#movDir = dir}

	get maxAlpha()   {return 1}
	get step()       {return 0}
	get frozen()     {return Timer.frozen}
	get isInTunnel() {return Maze.Tunnel.isIn(this.centerPos)}

	get tilePixel() {
		const  {x,y} = this.centerPos, v = Vec2[this.dir]
		const  count = v.x? x % T : y % T
		return (v.x || v.y) > 0 ? count : T-count
	}
	get inFrontOfTile() {return this.tilePixel <= T/2}
	get inBackOfTile()  {return this.tilePixel >  T/2}

	static update() {
		Player.instance.update()
		GhsMgr.update()
	}
	static draw() {
		GhsMgr.drawBehind()
		Player.instance.draw()
		GhsMgr.drawFront()
	}
	update(maxA=this.maxAlpha) {
		State.isReady   && (this.#fadeIn ||= new FadeIn)?.update(maxA)
		State.isPlaying && (this.#fadeIn &&= null)
	}
	draw() {
		Ctx.setAlpha(this.#fadeIn?.alpha ?? this.maxAlpha)
	}
	centering() {
		this.x = (CW-T)/2
	}
	tileJustUpdated(divisor=1) {
		return this.inFrontOfTile
			&& this.tilePixel <= this.step/divisor
	}
	setNextPos(divisor=1, dir=this.dir) {
		this.pos = Vec2[dir].mul(this.step/divisor).add(this)
	}

	/** @param {Direction} dir */
	move(dir) {this.setNextPos(1, this.dir=dir)}

	/** @param {Direction} dir */
	hasAdjWall(dir) {return Maze.hasWall(this.getAdjTile(dir))}

	/** @param {Direction} dir */
	getAdjTile(dir, tile=this.tilePos) {
		const  v = Vec2[dir].add(tile)
		return v.setX((v.x+Cols) % Cols) // x-axis loops
	}

	/** @param {Direction} dir */
	collidedWithWall(dir=this.dir) {
		const {step,centerPos}= this
		const {x,y}= Vec2[dir].mul(T/2+step).add(centerPos).divInt(T)
		return Maze.hasWall({x:(x+Cols) % Cols, y}) // x-axis loops
	}

	/**
	 * @param {number|OptionalPos} v
	 * @param {number} [n]
	 * @type {((x:number, y:number)=>void) & ((pos:OptionalPos)=>void)}
	 */
	setPos = (v,n)=> {
		let[x,y]= (typeof v == 'number')? [v,n] : [v.x,v.y]
		this.#y = (y ??= this.y);(x ??= this.x);
		this.#x = function(r) { // x-axis move loops during play
			if (!State.isPlaying) return
			if (x < -r-T/2) return CW+T/2
			if (x > CW+T/2) return -r-T/2
		}(this.radius) ?? x
	}
}
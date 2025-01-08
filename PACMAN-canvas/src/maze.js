import {Ticker} from '../_lib/timer.js'
import {Vec2}   from '../_lib/vec2.js'
import {L,R}    from '../_lib/direction.js'
import {Rect}   from '../_lib/rect.js'
import {Ctx}    from './_canvas.js'
import {BgCtx}  from './_canvas.js'
import {State}  from './_state.js'
import {Form}   from './control.js'
import {Color,TileSize as T}   from './_constants.js'
import {DotMax,ColMax,MapData} from './_constants.js'

const WallSet  = new Set()
const DotSet   = new Set()
const PowMap   = new Map()
const PenRect  = new Rect(10,13, 7,4)
const PenOuter = new Rect( 9,12, 9,6)

class PowDot {
	static #instance = null
	static get instance() {return this.#instance ||= new PowDot}
	constructor() {PowDot.#instance = this}
	#drawDot(pos) {
		if (!State.isPlaying
		 || Ticker.paused
		 || Ticker.count & 16)
			Maze.drawDot(Ctx, pos, true)
	}
	draw() {
		PowMap.forEach(this.#drawDot.bind(this))
	}
}
class Tunnel {
	entranceL =  5.5
	entranceR = 22.5
	isIn  = centerPos=> this.side(centerPos) != null
	isInL = centerPos=> this.side(centerPos) == L
	isInR = centerPos=> this.side(centerPos) == R
	side({x, y}={}) { // Coordinates in pixels
		if (int(y/T) == 15 && x/T <= this.entranceL) return L
		if (int(y/T) == 15 && x/T >= this.entranceR) return R
		return null
	}
}
export const Maze = new class {
	static {$ready(this.setup)}
	static setup() {
		$on('Title NewLevel', Maze.#resetDots)
		$(Form.powChk).on('change', Maze.#resetDots)
		MapData.forEach((t,i)=> !/[.O\x20]/.test(t) && WallSet.add(i))
	}
	Tunnel      = freeze(new Tunnel)
	Width       = ColMax   * T
	Center      = ColMax/2 * T
	PenEntrance = Vec2(13, 12).freeze()
	PenMiddleY  = (this.PenEntrance.y+3.5) * T
	hasDot      = index  => DotSet.has(index)
	hasPow      = index  => PowMap.has(index)
	hasWall     = ({x,y})=> WallSet.has(y*ColMax+x)
	isInHouse   = ({x,y})=> PenRect.contains({x,y})

	get PowDot()    {return PowDot.instance}
	get numOfDots() {return DotSet.size}
	get dotsLeft()  {return DotMax-(DotMax-DotSet.size)}

	GhostNotEnterSet = new Set(['12-11','12-23','15-11','15-23'])
	ghostExitPos({originalTarget:t=Vec2(), tilePos:pos=Vec2()}) {
		const  x = (pos.x > ColMax/2) && (t.x > ColMax/2) ? 21:6
		return t.y < 10 && PenOuter.contains(pos)? Vec2(t).setX(x) : t
	}
	#resetDots() {
		MapData.forEach((t,i)=> /[.O]/.test(t) && Maze.#setDot(t,i))
	}
	#setDot(tip, tileIdx) {
		const tilePos = Vec2.fromIdx(tileIdx, ColMax)
		Maze.clearDot({tileIdx,tilePos})
		DotSet.add(tileIdx)
		!Form.powChk.checked || (tip == '.')
			? Maze.drawDot(BgCtx, tilePos)
			: PowMap.set(tileIdx, tilePos)
	}
	clearDot({tileIdx,tilePos}) {
		DotSet.delete(tileIdx)
		PowMap.delete(tileIdx)
		Maze.drawDot(BgCtx, tilePos, true, null)
	}
	drawDot(ctx, {x,y}, isLarge=false, color=Color.Dot) {
		cvsFillCircle(ctx)(x*T+T/2, y*T+T/2, T/(isLarge? 2:8), color)
	}
	drawDoor() {
		if (State.isFlashMaze) return
		cvsFillRect(Ctx)(13*T, 13.56*T, T*2, T/4, Color.Door)
	}
};freeze(Maze)
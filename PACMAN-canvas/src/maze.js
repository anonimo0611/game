import {Rect}   from '../_lib/rect.js'
import {State}  from './state.js'
import {Ghost}  from './ghosts/ghost.js'
import {powChk} from './control.js'
import {Wall}   from './sprites/wall.js'

const MapArr = freeze([... `\
////////////////////////////\
A============65============B\
#............vV............#\
#.1hh2.1hhh2.vV.1hhh2.1hh2.#\
#Ov  V.v   V.vV.v   V.v  VO#\
#.4HH3.4HHH3.43.4HHH3.4HH3.#\
#..........................#\
#.1hh2.12.1hhhhhh2.12.1hh2.#\
#.4HH3.vV.4HH65HH3.vV.4HH3.#\
#......vV....vV....vV......#\
D____b.v8hh2 vV 1hh7V.a____C\
     #.v5HH3 43 4HH6V.#     \
     #.vV          vV.#     \
     #.vV XXXXXXXX vV.#     \
=====c.43 X      X 43.d=====\
      .   X      X   .      \
_____b.12 X      X 12.a_____\
     #.vV XXXXXXXX vV.#     \
     #.vV          vV.#     \
     #.vV 1hhhhhh2 vV.#     \
A====c.43 4HH65HH3 43.d====B\
#............vV............#\
#.1hh2.1hhh2.vV.1hhh2.1hh2.#\
#.4H6V.4HHH3.43.4HHH3.v5H3.#\
#O..vV.......  .......vV..O#\
8h2.vV.12.1hhhhhh2.12.vV.1h7\
5H3.43.vV.4HH65HH3.vV.43.4H6\
#......vV....vV....vV......#\
#.1hhhh78hh2.vV.1hh78hhhh2.#\
#.4HHHHHHHH3.43.4HHHHHHHH3.#\
#..........................#\
D__________________________C\
////////////////////////////\
////////////////////////////`])

/** `.` and `O` represent normal and power cookies
 ** @type {ReadonlySet<string>} */
const DotChipSet = new Set(['.','O'])

/** @typedef {number} TileIdx */
const WallSet  = /**@type {Set<TileIdx>}*/(new Set)
const DotSet   = /**@type {Set<TileIdx>}*/(new Set)
const PowMap   = /**@type {Map<TileIdx,Vector2>}*/(new Map)
const PenRect  = new Rect(10, 13,  8, 5)
const PenOuter = new Rect( 9, 12, 10, 7)

class House {
	get EntranceTile() {return Vec2(13, 12)}
	/** @param {Vector2} tilePos */
	isIn = tilePos=> PenRect.contains(tilePos)
	MiddleY = (this.EntranceTile.y+3.5)*T
}
class PowDot {
	#disp = /**@type {0|1}*/(1)
	draw() {
		this.#disp ^= +(Ticker.count % PowDotInterval == 0)
		for (const [,tPos] of PowMap) this.#draw(tPos)
	}
	/** @param {Vector2} t */
	#draw(t) {
		if (!State.isPlaying
		 || Ticker.paused
		 || this.#disp)
			Maze.drawDot(Ctx, t.x, t.y, true)
	}
}
class Tunnel {
	entranceL =  5.5
	entranceR = 22.5
	/**
	 * @param {Vector2} centerPos
	 * @param {'Left'|'Right'} [dir]
	 */
	isIn(centerPos, dir) {
		const where = this.#where(centerPos)
		if (dir == L) return (where == L)
		if (dir == R) return (where == R)
		return (where != null)
	}
	/** @param {Vector2} centerPos */
	#where({x, y}) {
		if (int(y/T) == 15 && x/T <= this.entranceL) return L
		if (int(y/T) == 15 && x/T >= this.entranceR) return R
		return null
	}
}

export const Maze = new class {
	static {$ready(this.setup)}
	static setup() {
		for (const [i,c] of MapArr.entries())
			!DotChipSet.has(c) && c.trim() && WallSet.add(i)
		$on({Title_NewLevel: Maze.#reset})
		$(powChk).on({change:Maze.#reset})
	}
	#reset(/**@type {Event}*/e) {
		if (e.target != powChk) {
			Wall.draw()
			Maze.#drawDoor()
		}
		for (const [i,c] of MapArr.entries())
			DotChipSet.has(c) && Maze.#setDot(i,c)
	}
	#setDot(
	 /**@type {TileIdx}*/i,
	 /**@type {string} */chip
	) {
		const t = Vec2(i%Cols, i/Cols|0)
		Maze.clearBgDot({tileIdx:i,tilePos:t})
		DotSet.add(i)
		!powChk.checked || chip == '.'
			? drawDot(Bg.ctx, t.x, t.y)
			: PowMap.set(i, t)
	}
	get dotsLeft() {return DotSet.size}
	Map    = MapArr
	DotMax = MapArr.filter(c=> DotChipSet.has(c)).length
	House  = freeze(new House)
	PowDot = freeze(new PowDot)
	Tunnel = freeze(new Tunnel)

	hasDot  = (/**@type {TileIdx} */i)=> DotSet.has(i)
	hasPow  = (/**@type {TileIdx} */i)=> PowMap.has(i)
	hasWall = (/**@type {Position}*/p)=> WallSet.has(p.y*Cols+p.x)

	/**
	 * These tiles(x-y) forbidden ghosts from entering upward
	 * @type {ReadonlySet<string>}
	 */
	GhostNoEnter = new Set(['12-11','12-23','15-11','15-23'])

	/**
	 * If the target tile is on the upper side of the maze \
	 * and the ghost is around the house, guide them outside of the area
	 * @param {Ghost} ghost
	 */
	ghostExitTile = ({originalTargetTile:o, tilePos:t})=>
		o.y < 10 && PenOuter.contains(t)
			? Vec2((t.x > Cols/2) && (o.x > Cols/2) ? 21:6, 15) : o

	/**
	 * @param {{tileIdx:number, tilePos:Vector2}} tile
	 * @returns {number} number of remaining dots
	 */
	clearBgDot({tileIdx:i,tilePos:t}) {
		DotSet.delete(i)
		PowMap.delete(i)
		drawDot(Bg.ctx, t.x, t.y, true, null)
		return DotSet.size
	}

	/**
	 * @param {ExtendedContext2D} ctx
	 * @param {number}  col
	 * @param {number}  row
	 * @param {boolean} isPow
	 * @param {?Cvs2DStyle} color
	 */
	drawDot(ctx, col,row, isPow=false, color=Color.Dot) {
		const v = Vec2(col,row).add(.5).mul(T).vals
		ctx.fillCircle(...v, T/(isPow? 2:8), color)
	}
	#drawDoor() {
		const y = (Maze.House.EntranceTile.y+1.6)*T
		Bg.ctx.fillRect(CW/2-T, y, T*2, T/4, Color.Door)
	}
}, {drawDot}=freeze(Maze)
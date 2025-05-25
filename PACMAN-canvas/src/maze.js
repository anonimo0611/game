import {Rect}   from '../_lib/rect.js'
import {State}  from './state.js'
import {Ghost}  from './ghosts/ghost.js'
import {powChk} from './control.js'
import {Wall}   from './sprites/wall.js'

const MapArr = freeze([... `\
////////////////////////////\
A============21============B\
#............||............#\
#.1--2.1---2.||.1---2.1--2.#\
#O|  |.|   |.||.|   |.|  |O#\
#.4--3.4---3.43.4---3.4--3.#\
#..........................#\
#.1--2.12.1------2.12.1--2.#\
#.4--3.||.4--21--3.||.4--3.#\
#......||....||....||......#\
D____b.|4--2 || 1--3|.a____C\
     #.|1--3 43 4--2|.#     \
     #.||          ||.#     \
     #.|| XXXXXXXX ||.#     \
=====c.43 X      X 43.d=====\
      .   X      X   .      \
_____b.12 X      X 12.a_____\
     #.|| XXXXXXXX ||.#     \
     #.||          ||.#     \
     #.|| 1------2 ||.#     \
A====c.43 4--21--3 43.d====B\
#............||............#\
#.1--2.1---2.||.1---2.1--2.#\
#.4-2|.4---3.43.4---3.|1-3.#\
#O..||.......  .......||..O#\
4-2.||.12.1------2.12.||.1-3\
1-3.43.||.4--21--3.||.43.4-2\
#......||....||....||......#\
#.1----34--2.||.1--34----2.#\
#.4--------3.43.4--------3.#\
#..........................#\
D__________________________C\
////////////////////////////\
////////////////////////////`])

/** @typedef {number} TileIdx */

const WallSet  = /**@type {Set<TileIdx>}*/(new Set)
const DotSet   = /**@type {Set<TileIdx>}*/(new Set)
const PowMap   = /**@type {Map<TileIdx,Vector2>}*/(new Map)
const DotChip  = new Set(['.','O'])
const PenRect  = new Rect(10,13, 7,4)
const PenOuter = new Rect( 9,12, 9,6)

class House {
	get EntranceTile() {return Vec2(13, 12)}
	/** @param {Vector2} tilePos */
	isIn = tilePos=> PenRect.contains(tilePos)
	MiddleY = (this.EntranceTile.y+3.5)*T
}
class PowDot {
	#disp = 1
	/** @param {Vector2} t */
	#draw(t) {
		if (!State.isPlaying
		 || Ticker.paused
		 || this.#disp)
			Maze.drawDot(Ctx, t.x, t.y, true)
	}
	draw() {
		this.#disp ^= +(Ticker.count % PowDotInterval == 0)
		for (const [,tPos] of PowMap) this.#draw(tPos)
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
			!DotChip.has(c) && c.trim() && WallSet.add(i)
		$on({Title_NewLevel: Maze.#reset})
		$(powChk).on({change:Maze.#reset})
	}
	/** @param {Event} e */
	#reset(e) {
		if (e.target != powChk) {
			Wall.draw()
			Maze.#drawDoor()
		}
		for (const [i,c] of MapArr.entries())
			DotChip.has(c) && Maze.#setDot(i,c)
	}
	/**
	 * @param {TileIdx} idx
	 * @param {string}  chip
	 */
	#setDot(idx, chip) {
		const t = Vec2(idx%Cols, idx/Cols|0)
		Maze.clearBgDot({tileIdx:idx,tilePos:t})
		DotSet.add(idx)
		!powChk.checked || chip == '.'
			? drawDot(Bg.ctx, t.x, t.y)
			: PowMap.set(idx, t)
	}
	get dotsLeft() {return DotSet.size}
	Map    = MapArr
	DotMax = MapArr.filter(c=> DotChip.has(c)).length
	House  = freeze(new House)
	PowDot = freeze(new PowDot)
	Tunnel = freeze(new Tunnel)

	hasDot  = (/**@type {TileIdx} */i)=> DotSet.has(i)
	hasPow  = (/**@type {TileIdx} */i)=> PowMap.has(i)
	hasWall = (/**@type {Position}*/p)=> WallSet.has(p.y*Cols+p.x)

	/** These tiles(x-y) forbidden ghosts from entering upward */
	GhostNotEnterSet = new Set(['12-11','12-23','15-11','15-23'])

	/**
	 * If the target tile is on the upper side of the maze \
	 * and the ghost is around the house, guid them outside of it
	 * @param {Ghost} ghost
	 */
	ghostExitTile = ({originalTargetTile:o, tilePos:t})=>
		o.y < 10 && PenOuter.contains(t)
			? Vec2((t.x > Cols/2) && (o.x > Cols/2) ? 21:6, 15) : o

	/**
	 * @param {{tileIdx:TileIdx, tilePos:Vector2}} tile
	 * @return {number} number of remaining dots
	 */
	clearBgDot({tileIdx:idx,tilePos:t}) {
		DotSet.delete(idx)
		PowMap.delete(idx)
		drawDot(Bg.ctx, t.x, t.y, true, null)
		return DotSet.size
	}

	/**
	 * @param {ExtendedContext2D} ctx
	 * @param {number}    col
	 * @param {number}    row
	 * @param {boolean}   isLarge
	 * @param {?CtxStyle} color
	 */
	drawDot(ctx, col,row, isLarge=false, color=Color.Dot) {
		ctx.fillCircle(col*T+T/2, row*T+T/2, T/(isLarge? 2:8), color)
	}
	#drawDoor() {
		Bg.ctx.fillRect(13*T, 13.6*T, T*2, T/4, Color.Door)
	}
}, {drawDot}=freeze(Maze)
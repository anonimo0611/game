import {Rect}   from '../_lib/rect.js'
import {State}  from './state.js'
import {Ghost}  from './ghosts/ghost.js'
import {Wall}   from './sprites/wall.js'
import {powChk} from './control.js'

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

/**
 `.` and `O` represent normal and power cookies
 @type {ReadonlySet<string>}
*/const DotChipSet = new Set([...'.O'])

const WallSet  = /**@type {Set<number>}*/(new Set)
const DotSet   = /**@type {Set<number>}*/(new Set)
const PowMap   = /**@type {Map<number,Position>}*/(new Map)
const PenRect  = new Rect(10, 13,  8, 5).freeze()
const PenOuter = new Rect( 9, 12, 10, 7).freeze()

class House {
	MiddleY = (this.EntryTile.y+3.5)*T
	get EntryTile() {return Vec2.new(13, 12)}
	isIn = (/**@type {Vec2}*/tile)=> PenRect.contains(tile)
}
class Tunnel {
	Row = 15
	EntryColL =  5.5
	EntryColR = 22.5
	/** Position in pixels */
	findSide({x=0,y=0}) {
		if (int(y/T) == this.Row) {
			if (x/T <= this.EntryColL) return L
			if (x/T >= this.EntryColR) return R
		} return null
	}
}
export class PowBlinker {
	#show = 1
	get show() {return this.#show == 1}
	update() {this.#show ^= +(Ticker.count % 15 == 0)}
}
class PowDotsRenderer extends PowBlinker {
	draw() {
		for (const {x,y} of PowMap.values()) {
			if (!State.isInGame || Ticker.paused || this.show)
				Maze.drawDot(Ctx, x,y, true)
		}
	}
}

export const Maze = freeze(new class {
	static {
		for (const [i,c] of MapArr.entries())
			!DotChipSet.has(c) && c.trim() && WallSet.add(i)
		State.on({_NewLevel: e=> this.reset(e)})
		$(powChk).on({change:e=> this.reset(e)})
	}
	static reset(
	 /**@type {JQuery.TriggeredEvent}*/e
	) {
		e.target != powChk && Wall.draw()
		for (const [i,c] of MapArr.entries())
			DotChipSet.has(c) && this.setDot(i,c)
	}
	static setDot(
	 /**@type {number}*/i,
	 /**@type {string}*/chip
	) {
		const t = Vec2.new(i%Cols, i/Cols|0)
		const m = Vec2.new(t).add(.5)
		DotSet.add(i)
		clearDot({tileIdx:i,tileMid:m})
		!powChk.checked || chip == '.'
			? drawDot(Bg,...t.vals)
			: PowMap.set(i, t)
	}
	Top     = 1
	Bottom  = Rows-3
	Map     = MapArr
	MaxDot  = MapArr.filter(c=> DotChipSet.has(c)).length
	House   = freeze(new House)
	Tunnel  = freeze(new Tunnel)
	PowDots = freeze(new PowDotsRenderer)

	hasDot  = (/**@type {number}  */i)=> DotSet.has(i)
	hasPow  = (/**@type {number}  */i)=> PowMap.has(i)
	hasWall = (/**@type {Position}*/p)=> WallSet.has(p.y*Cols+p.x)

	get dotsLeft() {return DotSet.size}

	/**
	 Tiles where the specified direction is disallowed for ghost navigation \
	 Format ex: `${x}-${y}${Direction}`
	 @type {ReadonlySet<string>}
	*/
	GhostNoEntryTiles = new Set(['12-11Up','12-23Up','15-11Up','15-23Up'])

	/**
	 Whether tile `row` coord is the top/bottom of the maze excluding dead space
	 @param {number} row
	*/
	isTopOrBottom = row=> (row == Maze.Top) || (row == Maze.Bottom)

	/**
	 If the target tile is on the upper side of the maze \
	 and the ghost is around the house, guide them outside of the area
	 @param {Ghost} Ghost
	*/
	getGhostExitTile = ({originalTargetTile:o, tilePos:t})=>
		o.y < 10 && PenOuter.contains(t)
			? o.set(t.x>Cols/2 && o.x>Cols/2 ? 21:6, 15) : o

	/**
	 @param {{tileIdx:number,tileMid:Vec2}} tile
	 @returns {number} Number of remaining dots
	*/
	clearDot({tileIdx:i,tileMid:{x,y}}) {
		DotSet.delete(i)
		PowMap.delete(i)
		Bg.setSquare(x*T, y*T, DotR+1)
		return DotSet.size
	}

	/**
	 @param {ExtendedContext2D} ctx
	 @param {number} col
	 @param {number} row
	*/
	drawDot(ctx, col,row, isPow=false, visible=true) {
		if (!visible) return
		const {x,y} = Vec2.new(col,row).add(.5).mul(T)
		ctx.fillCircle(x,y, (isPow? PowR:DotR), Colors.Dot)
	}
}), {drawDot,clearDot}= Maze
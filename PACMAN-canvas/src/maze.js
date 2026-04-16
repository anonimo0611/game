import {Rect}  from '../_lib/rect.js'
import {State} from './state.js'
import {Ghost} from './ghosts/ghost.js'
import {Wall}  from './sprites/wall.js'
import {Ctrl,powChk} from './control.js'

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

const DotSet  = /**@type {Set<TileIdx>}*/(new Set)
const WallSet = /**@type {ReadonlySet<TileIdx>} */(new Set)
const PowMap  = /**@type {Map<TileIdx,Position>}*/(new Map)

const DotRadius  = T/9
const PowRadius  = T/2
const DotSymbols = new Set([...'.O'])
const HouseRect  = new Rect(14-4, 15-2,  8, 5).freeze()
const HouseOuter = new Rect(14-5, 15-3, 10, 7).freeze()

class House {
	MidY = (this.EntryTile.y+3.5)*T
	get EntryTile() {
		return Vec2.new(13, 12)
	}
	/** @param {Position} tilePos */
	isIn(tilePos) {
		return HouseRect.contains(tilePos)
	}
	/** @param {Ghost} g */
	arrived(g, spd=1) {
		return g.state.isEscaping
			&& g.tile.y == this.EntryTile.y
			&& abs(BW/2 - g.center.x) <= spd
	}
}

class Tunnel {
	Row = 15
	EntryColL =  5.5
	EntryColR = 22.5
	findSide({x=0,y=0}) {
		if (int(y/T) == this.Row) {
			if (x/T <= this.EntryColL) return L
			if (x/T >= this.EntryColR) return R
		} return null
	}
}

export class PowBlinker {
	#show = 1
	get show() {
		return this.#show == 1
	}
	update() {
		this.#show ^= +(Ticker.count % 15 == 0)
	}
}
class PowDots extends PowBlinker {
	draw() {
		for (const {x,y} of PowMap.values()) {
			if (!State.isInGame || Ticker.paused || this.show)
				drawDot(Fg, x,y, true)
		}
	}
}

class MazeManager {
	static {
		const wallSet = /**@type {Set<TileIdx>}*/(WallSet)
		for (const [i,s] of MapArr.entries())
			!DotSymbols.has(s) && s.trim() && wallSet.add(i)
		State.on({_NewLevel: this.reset})
		$(powChk).on({change:this.reset})
	}
	static reset(/**@type {JQTriggeredEvent}*/e) {
		e.target != powChk && Wall.draw()
		for (const [i,s] of MapArr.entries())
			DotSymbols.has(s) && MazeManager.setDot(i,s)
	}
	static setDot(/**@type {TileIdx}*/i, symbol='.') {
		const t = Vec2.new(i%Cols, i/Cols|0)
		clearDot({tileIdx:i, tileMid:t.clone.add(.5)})
		DotSet.add(i)
		powChk.checked == false || symbol == '.'
			? drawDot(Bg, ...t.vals)
			: PowMap.set(i,t)
	}
	Map     = MapArr
	MaxDot  = MapArr.filter(c=> DotSymbols.has(c)).length
	House   = freeze(new House)
	Tunnel  = freeze(new Tunnel)
	PowDots = freeze(new PowDots)
	hasDot  = (/**@type {TileIdx} */i)=> DotSet.has(i)
	hasPow  = (/**@type {TileIdx} */i)=> PowMap.has(i)
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
	isTopOrBottom = row=> (row == 1) || (row == Rows-3)

	/**
	 If the target tile is on the upper side of the maze \
	 and the ghost is around the house, guide them outside of the area
	 @param {{baseTargetTile:Vec2,tile:Vec2}} ghost
	*/
	getGhostExitTile = ({baseTargetTile:b,tile:t})=>
		!Ctrl.unrestricted && b.y < 10 && HouseOuter.contains(t)
			? Vec2.new(t.x>Cols/2 && b.x>Cols/2 ? 21:6, 15) : b

	/**
	 @param {{tileIdx:number,tileMid:Vec2}} tile
	 @returns {number} Number of remaining dots
	*/
	clearDot({tileIdx:i,tileMid:{x,y}}) {
		const r = DotRadius+1
		DotSet.delete(i)
		PowMap.delete(i)
		Bg.clearRect(x*T-r, y*T-r, r*2, r*2)
		return DotSet.size
	}

	/**
	 @param {EnhancedCtx2D} ctx
	 @param {number} col
	 @param {number} row
	*/
	drawDot(ctx, col,row, isPow=false, visible=true) {
		if (!visible) return
		const [x,y] = [col,row].map(v=> (v+0.5)*T)
		const r = [DotRadius,PowRadius][+isPow]
		ctx.fillCircle(x,y, r, Color.Cookie)
	}
}
export const Maze = freeze(new MazeManager)
export const {drawDot,clearDot}= Maze
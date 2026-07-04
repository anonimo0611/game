import {Rect}   from '../_lib/rect.js'
import {State}  from './state.js'
import {Cfg}    from './env.js'
import {powChk} from './ui.js'
import {Ghost}  from './ghosts/ghost.js'
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

const DOT_RADIUS = T/9
const POW_RADIUS = T/2
const DotSymbols = new Set([...'.O'])
const HouseInner = new Rect(14-4, 15-2,  8, 5).freeze()
const HouseOuter = new Rect(14-5, 15-3, 10, 7).freeze()

const WallSet = /**@type {Set<TileIdx>}*/(new Set)
const DotSet  = /**@type {Set<TileIdx>}*/(new Set)
const PowMap  = /**@type {Map<TileIdx,Position>}*/(new Map)

;{//Map and dot initialization block
	MapArr.forEach((s,i)=> {
		!DotSymbols.has(s) && s.trim() && WallSet.add(i)
	})
	/** @param {JQTriggeredEvent} e */
	function reset(e) {
		e.target != powChk && Wall.draw()
		MapArr.forEach((s,i)=> {
			if (!DotSymbols.has(s)) return
			const t = Vec2.new(i%COLS, i/COLS|0)
			const m = Vec2.add(t, 0.5)
			clearDot({tileIdx:i, tileMid:m})
			DotSet.add(i)
			powChk.checked == false || s == '.'
				? drawDot(Bg, ...t.vals)
				: PowMap.set(i, t)
		})
	}
	State.on({_NewLevel: reset})
	$(powChk).on({change:reset})
}

class House {
	MID_Y = (this.EntryTile.y+3.5)*T
	get EntryTile() {return Vec2.new(13, 12)}

	/** @param {Position} tilePos */
	isIn = tilePos=> HouseInner.contains(tilePos)

	/** @param {Ghost} g */
	arrived(g, spd=g.speed) {
		return g.state.isEscaping
			&& g.tile.y == this.EntryTile.y
			&& abs(BW/2 - g.center.x) <= spd
	}
}

class Tunnel {
	ROW = 15
	EntryCol = freeze({L:5.5, R:22.5})
	findSide({x=0,y=0}) {
		if (int(y/T) == this.ROW) {
			if (x/T <= this.EntryCol.L) return L
			if (x/T >= this.EntryCol.R) return R
		} return null
	}
}

export class PowBlinker {
	#show = 1
	get show() {return this.#show == 1}
	update() {this.#show ^= +(Ticker.count % 15 == 0)}
}
class PowDots extends PowBlinker {
	draw() {
		PowMap.forEach(({x,y})=> {
			if (!State.isInGame || Ticker.paused || this.show)
				drawDot(Fg, x,y, true)
		})
	}
}

export const Maze = freeze({
	Map:     MapArr,
	MaxDot:  MapArr.filter(c=> DotSymbols.has(c)).length,
	House:   freeze(new House),
	Tunnel:  freeze(new Tunnel),
	PowDots: freeze(new PowDots),
	hasDot:  (/**@type {TileIdx} */i)=> DotSet.has(i),
	hasPow:  (/**@type {TileIdx} */i)=> PowMap.has(i),
	hasWall: (/**@type {Position}*/p)=> WallSet.has(p.y*COLS+p.x),

	CLEAR_DOTS: 0, // for debug
	get dotsLeft() {return DotSet.size},

	/**
	 Tiles where the specified direction is disallowed for ghost navigation \
	 Format ex: `${x}-${y}${Direction}`
	 @type {ReadonlySet<string>}
	*/
	GhostNoEntryTiles: new Set(['12-11Up','12-23Up','15-11Up','15-23Up']),

	/**
	 Whether tile `row` coord is the top/bottom of the maze excluding dead space
	 @param {number} row
	*/
	isTopOrBottom: row=> (row == 1) || (row == ROWS-3),

	/**
	 If the target tile is on the upper side of the maze \
	 and the ghost is around the house, guide them outside of the area
	 @param {Ghost} ghost
	 @param {Vec2}  curr
	*/
	getGhostExitTile: ({baseTargetTile:b}, curr)=>
		!Cfg.unrestricted && b.y < 10 && HouseOuter.contains(curr)
			? Vec2.new((curr.x>COLS/2 && b.x>COLS/2 ? 21:6), 15) : b,

	/**
	 @param {{tileIdx:number,tileMid:Vec2}} tile
	 @returns {number} Number of remaining dots
	*/
	clearDot({tileIdx:i, tileMid:{x,y}}) {
		const r = DOT_RADIUS+1
		DotSet.delete(i)
		PowMap.delete(i)
		Bg.clearRect(x*T-r, y*T-r, r*2, r*2)
		return DotSet.size
	},

	/**
	 @param {Ctx2D}  ctx
	 @param {number} col
	 @param {number} row
	*/
	drawDot(ctx, col,row, isPow=false, isVisible=true) {
		if (!isVisible) return
		const [x,y] = [col,row].map(v=> (v+0.5)*T)
		const r = (isPow? POW_RADIUS : DOT_RADIUS)
		ctx.fillCircle(x,y, r, Color.Cookie)
	},
})
export const {drawDot,clearDot}= Maze
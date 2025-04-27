import {Rect}   from '../_lib/rect.js'
import {State}  from './state.js'
import {Pacman} from './pacman.js'
import {powChk} from './control.js'

export const MapStr = `\
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
////////////////////////////`

/** @type {Set<number>} */
const DotSet = new Set()

/** @type {Set<number>} */
const WallSet = new Set()

/** @type {Map<number,Vector2>} */
const PowMap = new Map()

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
	draw() {
		this.#disp ^= Ticker.count % 15 == 0
		for (const [,pos] of PowMap) {
			if (!State.isPlaying
			 || Ticker.paused
			 || this.#disp)
				Maze.drawDot(Ctx, pos, true)
		}
	}
}
class Tunnel {
	entranceL =  5.5
	entranceR = 22.5
	/**
	  * @param {Vector2} centerPos
	  * @param {L|R} [dir]
	  */
	isIn(centerPos, dir) {
		const where = this.#where(centerPos)
		if (dir == L) return (where == L)
		if (dir == R) return (where == R)
		return where != null
	}
	#where({x, y}={}) {
		if (int(y/T) == 15 && x/T <= this.entranceL) return L
		if (int(y/T) == 15 && x/T >= this.entranceR) return R
		return null
	}
}

export const Maze = new class {
	static {$ready(this.setup)}
	static setup() {
		for (const [i,c] of Maze.Map.entries())
			/[^.O\s]/.test(c) && WallSet.add(i)
		$on({Title_NewLevel: Maze.#reset})
		$(powChk).on({change:Maze.#reset})
	}
	#reset(e) {
		for (const [i,c] of Maze.Map.entries())
			/[.O]/.test(c) && Maze.#setDot(i,c)
		e.target != powChk && Maze.#drawDoor()
	}
	/**
	 * @param {number} idx
	 * @param {string} chip
	 */
	#setDot(idx, chip) {
		const v = Vec2(idx%Cols, idx/Cols|0)
		Maze.clearBgDot({tileIdx:idx,tilePos:v})
		DotSet.add(idx)
		!powChk.checked || (chip == '.')
			? drawDot(Bg.ctx, v)
			: PowMap.set(idx, v)
	}
	get dotsLeft() {return DotSet.size}
	GhostNotEnterSet = new Set(['12-11','12-23','15-11','15-23'])

	DotMax  = MapStr.match(/[.O]/g).length
	Map     = freeze([...MapStr])
	House   = freeze(new House)
	PowDot  = freeze(new PowDot)
	Tunnel  = freeze(new Tunnel)

	/** @param {number} tileIdx */
	hasDot = tileIdx=> DotSet.has(tileIdx)

	/** @param {number} tileIdx */
	hasPow = tileIdx=> PowMap.has(tileIdx)

	/** @param {Position} */
	hasWall = ({x,y})=> WallSet.has(y*Cols+x)

	/** @param {Object.<string,Vector2>} */
	ghostExitTile = ({originalTargetTile:o, tilePos:t})=>
		o.y < 10 && PenOuter.contains(t)
			? Vec2((t.x > Cols/2) && (o.x > Cols/2) ? 21:6, 15) : o

	/** @param {Pacman} */
	clearBgDot({tileIdx:idx,tilePos:v}) {
		DotSet.delete(idx)
		PowMap.delete(idx)
		drawDot(Bg.ctx, v, true, null)
		return DotSet.size
	}
	/**
	 * @param {ExtendedContext2D} ctx
	 * @param {Position}
	 */
	drawDot(ctx, {x,y}, isLarge=false, color=Color.Dot) {
		ctx.fillCircle(x*T+T/2, y*T+T/2, T/(isLarge? 2:8), color)
	}
	#drawDoor() {
		Bg.ctx.fillRect(13*T, 13.6*T, T*2, T/4, Color.Door)
	}
}, {drawDot}=freeze(Maze)
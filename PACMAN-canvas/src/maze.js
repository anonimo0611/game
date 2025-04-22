import {Rect}   from '../_lib/rect.js'
import {Pacman} from './pacman.js'
import {State}  from './state.js'
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

const DotSet   = new Set()
const WallSet  = new Set()
const PowMap   = new Map()
const PenRect  = new Rect(10,13, 7,4)
const PenOuter = new Rect( 9,12, 9,6)

class House {
	get EntranceTile() {return Vec2(13, 12)}
	isIn = tilePos=> PenRect.contains(tilePos)
	MiddleY = (this.EntranceTile.y+3.5)*T
}
class PowDot {
	#disp = 1
	#drawDot(pos) {
		if (!State.isPlaying
		 || Ticker.paused
		 || this.#disp)
			Maze.drawDot(Ctx, pos, true)
	}
	draw() {
		this.#disp ^= Ticker.count % 15 == 0
		for (const [,p] of PowMap) this.#drawDot(p)
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
		for (const [i,c] of Maze.Map.entries())
			/[^.O\s]/.test(c) && WallSet.add(i)
		$on({Title_NewLevel: Maze.#resetDots})
		$(powChk).on({change:Maze.#resetDots})
	}
	#resetDots() {
		for (const [i,c] of Maze.Map.entries())
			/[.O]/.test(c) && Maze.#setDot(i,c)
	}
	#setDot(i, chip) {
		const v = Vec2(i%Cols, i/Cols|0)
		Maze.clearBgDot({tileIdx:i,tilePos:v})
		DotSet.add(i)
		!powChk.checked || (chip == '.')
			? drawDot(Bg.ctx, v)
			: PowMap.set(i, v)
	}
	get dotsLeft() {return DotSet.size}

	DotMax  = MapStr.match(/[.O]/g).length
	Map     = freeze([...MapStr])
	House   = freeze(new House)
	PowDot  = freeze(new PowDot)
	Tunnel  = freeze(new Tunnel)
	hasDot  = tileIdx=> DotSet.has(tileIdx)
	hasPow  = tileIdx=> PowMap.has(tileIdx)
	hasWall = ({x,y})=> WallSet.has(y*Cols+x)

	GhostNotEnterSet = new Set(['12-11','12-23','15-11','15-23'])
	ghostExitPos({originalTargetTile:o={}, tilePos:t={}}) {
		return o.y < 10 && PenOuter.contains(t)
			? Vec2((t.x > Cols/2) && (o.x > Cols/2) ? 21:6, 15)
			: Vec2(o)
	}
	/** @param {Pacman} */
	clearBgDot({tileIdx:i,tilePos:v}) {
		DotSet.delete(i)
		PowMap.delete(i)
		drawDot(Bg.ctx, v, true, null)
		return DotSet.size
	}
	/** @param {ExtendedContext2D} ctx */
	drawDot(ctx, {x,y}=Vec2(), isLarge=false, color=Color.Dot) {
		ctx.fillCircle(x*T+T/2, y*T+T/2, T/(isLarge? 2:8), color)
	}
	drawDoor() {
		if (State.isFlashMaze) return
		Ctx.fillRect(13*T, 13.6*T, T*2, T/4, Color.Door)
	}
}, {drawDot}=freeze(Maze)
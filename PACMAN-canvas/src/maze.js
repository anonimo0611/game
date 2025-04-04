import {Rect}   from '../_lib/rect.js'
import {Pacman} from './pacman/_pacman.js'
import {State}  from './state.js'

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
	get Entrance() {return Vec2(13, 12)}
	isIn = tilePos=> PenRect.contains(tilePos)
	MiddleY = (this.Entrance.y+3.5)*T
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
		Maze.Map.forEach((c,i)=> /[^.O\s]/.test(c) && WallSet.add(i))
		const resetDots = ()=> Maze.Map.forEach(Maze.#setDot)
		$on('Title NewLevel', resetDots)
		$('#powChk').on('change', resetDots)
	}
	get dotsLeft() {return DotSet.size}

	DoxMax  = MapStr.match(/[.O]/g).length
	Map     = freeze([...MapStr])
	House   = freeze(new House)
	PowDot  = freeze(new PowDot)
	Tunnel  = freeze(new Tunnel)
	hasDot  = tileIdx=> DotSet.has(tileIdx)
	hasPow  = tileIdx=> PowMap.has(tileIdx)
	hasWall = ({x,y})=> WallSet.has(y*Cols+x)

	GhostNotEnterSet = new Set(['12-11','12-23','15-11','15-23'])
	ghostExitPos({originalTarget:o={}, tilePos:t={}}) {
		return o.y < 10 && PenOuter.contains(t)
			? Vec2((t.x > Cols/2) && (o.x > Cols/2) ? 21:6, 15)
			: Vec2(o)
	}
	#setDot(chip, i) {
		if (!/[.O]/.test(chip)) return
		const v = Vec2(i%Cols, i/Cols|0)
		Maze.clearBgDot({tileIdx:i,tilePos:v})
		DotSet.add(i)
		!byId('powChk').checked || (chip == '.')
			? drawDot(Bg.ctx, v)
			: PowMap.set(i, v)
	}
	/** @param {Pacman} */
	clearBgDot({tileIdx:i,tilePos:v}) {
		DotSet.delete(i)
		PowMap.delete(i)
		drawDot(Bg.ctx, v, true, null)
		return DotSet.size
	}
	/**
	 * @param {ExtendedContext2D} ctx
	 * @param {Vector2}
	 */
	drawDot(ctx, {x,y}, isLarge=false, color=Color.Dot) {
		ctx.fillCircle(x*T+T/2, y*T+T/2, T/(isLarge? 2:8), color)
	}
	drawDoor() {
		if (State.isFlashMaze) return
		Ctx.fillRect(13*T, 13.6*T, T*2, T/4, Color.Door)
	}
}, {drawDot}=freeze(Maze)
import {Ticker} from '../_lib/timer.js'
import {Vec2}   from '../_lib/vec2.js'
import {L,R}    from '../_lib/direction.js'
import {Rect}   from '../_lib/rect.js'
import {Ctx}    from './_canvas.js'
import {BgCtx}  from './_canvas.js'
import {State}  from './_state.js'
import {MapData,ColMax,Color,TileSize as T} from './_constants.js'

const Form     = document.forms[0]
const WallSet  = new Set()
const DotSet   = new Set()
const PowMap   = new Map()
const PenRect  = new Rect(10,13, 7,4)
const PenOuter = new Rect( 9,12, 9,6)

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
		if (!Form) return
		$on('Title NewLevel', Maze.#resetDots)
		$(Form.powChk).on('change', Maze.#resetDots)
		MapData.forEach((c,i)=> !/[.O\x20]/.test(c) && WallSet.add(i))
	}
	get dotsLeft() {return DotSet.size}

	PowDot      = freeze(new PowDot)
	Tunnel      = freeze(new Tunnel)
	Width       = ColMax   * T
	Center      = ColMax/2 * T
	PenEntrance = Vec2(13, 12).freeze()
	PenMiddleY  = (this.PenEntrance.y+3.5) * T
	hasDot      = index  => DotSet.has(index)
	hasPow      = index  => PowMap.has(index)
	hasWall     = ({x,y})=> WallSet.has(y*ColMax+x)
	isInHouse   = ({x,y})=> PenRect.contains({x,y})

	GhostNotEnterSet = new Set(['12-11','12-23','15-11','15-23'])
	ghostExitPos({originalTarget:t={}, tilePos:pos={}}) {
		const  x = (pos.x > ColMax/2) && (t.x > ColMax/2) ? 21:6
		return t.y < 10 && PenOuter.contains(pos)? Vec2(t).setX(x) : Vec2(t)
	}
	#resetDots() {
		MapData.forEach((c,i)=> /[.O]/.test(c) && Maze.#setDot(c,i))
	}
	#setDot(chip, i) {
		const v = Vec2(i%ColMax, i/ColMax|0)
		Maze.clearDot({tileIdx:i,tilePos:v})
		DotSet.add(i)
		!Form.powChk.checked || (chip == '.')
			? Maze.drawDot(BgCtx, v)
			: PowMap.set(i, v)
	}
	clearDot({tileIdx:i,tilePos:v}) {
		DotSet.delete(i)
		PowMap.delete(i)
		Maze.drawDot(BgCtx, v, true, null)
		return DotSet.size
	}
	drawDot(ctx, {x,y}={}, isLarge=false, color=Color.Dot) {
		cvsFillCircle(ctx)(x*T+T/2, y*T+T/2, T/(isLarge? 2:8), color)
	}
	drawDoor() {
		if (State.isFlashMaze) return
		cvsFillRect(Ctx)(13*T, 13.58*T, T*2, T/4, Color.Door)
	}
};freeze(Maze)
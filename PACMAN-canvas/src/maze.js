import {Rect}   from '../_lib/rect.js'
import {State}  from './_state.js'
import {MapArr} from './_map_data.js'

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
		MapArr.forEach((c,i)=> /[^.O\s]/.test(c) && WallSet.add(i))
		const resetDots = ()=> MapArr.forEach(Maze.#setDot)
		$on('Title NewLevel', resetDots)
		$('#powChk').on('change', resetDots)
	}
	get dotsLeft() {return DotSet.size}

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
		if (/[^.O]/.test(chip)) return
		const v = Vec2(i%Cols, i/Cols|0)
		Maze.clearBgDot({tileIdx:i,tilePos:v})
		DotSet.add(i)
		!byId('powChk').checked || (chip == '.')
			? drawDot(Bg.ctx, v)
			: PowMap.set(i, v)
	}
	clearBgDot({tileIdx:i,tilePos:v}) {
		DotSet.delete(i)
		PowMap.delete(i)
		drawDot(Bg.ctx, v, true, null)
		return DotSet.size
	}
	drawDot(ctx, {x,y}={}, isLarge=false, color=Color.Dot) {
		ctx.fillCircle(x*T+T/2, y*T+T/2, T/(isLarge? 2:8), color)
	}
	drawDoor() {
		if (State.isFlashMaze) return
		Ctx.fillRect(13*T, 13.6*T, T*2, T/4, Color.Door)
	}
}, {drawDot}=freeze(Maze)
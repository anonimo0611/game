const W  = Cols
const HT = T/2
const OO = 2 // Outer Offset
const LO = 4 // Line Offset
const LW = 3 // Line Width

import {Maze}  from '../maze.js'
import {State} from '../state.js'
export const Wall = new class {
	draw(color=Colors.Wall) {
		Bg.clear()
		Bg.save()
		Bg.lineWidth   = LW
		Bg.strokeStyle = color
		Maze.Map.forEach(Wall.#drawTile)
		Wall.#drawHouse()
		Wall.#drawDoor()
		Bg.restore()
	}
	flashing(/**@type {function}*/fn) {
		let count = 0
		;(function redraw() {
			if (++count > 8) return Timer.set(500, fn)
			Wall.draw([, Colors.FlashWall][count % 2])
			Timer.set(250, redraw)
		})()
	}
	#drawDoor() {
		if (State.isFlashing) return
		const y = (Maze.House.EntranceTile.y+1.6)*T
		Bg.fillRect(BW/2-T, y, T*2, T/4, Colors.Door)
	}
	#drawHouse() {
		const [ix,iy,ox,oy]= [31,16,34,19].map(n=>n/10*T)
		Bg.save()
		Bg.translate(BW/2, Maze.House.MiddleY)
		Bg.strokeRect(-ox, -oy, ox*2, oy*2)
		Bg.strokeRect(-ix, -iy, ix*2, iy*2)
		Bg.clearRect (-T, -oy-LW, T*2, HT)
		Bg.strokeLine(-T-LW/2, -oy, -T-LW/2, -iy)
		Bg.strokeLine(+T+LW/2, -oy, +T+LW/2, -iy)
		Bg.restore()
	}
	/**
	 @param {{type:number, ci:number, x:number, y:number}} cfg
	*/
	#drawCorner({type,ci,x,y}) {
		Bg.save()
		Bg.translate(x+HT, y+HT)
		Bg.rotate(ci*PI/2)
		Bg.beginPath()
		switch(type) {
		case 0: Bg.arc(HT,HT, T-OO,  PI,-PI/2);break
		case 1: Bg.arc(HT,HT, HT+LO, PI,-PI/2);break
		case 2: Bg.arc(HT,HT, HT-LO, PI,-PI/2);break
		case 3: Bg.arc(HT,HT, OO,    PI,-PI/2);break
		case 4: Bg.moveTo(-LO,  HT)
			Bg.arcTo (-LO, -LO, T/3-LO, -LO, T/3)
			Bg.lineTo( HT, -LO)
			break
		}
		Bg.stroke()
		Bg.restore()
	}
	/**
	 @param {string} c Tile chip
	 @param {number} i Tile index
	*/
	#drawTile(c, i) {
		const [n,tx,ty]= [Number(c),i%W,int(i/W)], [x,y]= [tx*T,ty*T]
		const ci = n? n-(n>4 ? 5:1) : 'ABCD'.indexOf(c.toUpperCase())
		const lo = (c == '#' && tx<W/2) || /[VH=]/.test(c) ? -LO:LO

		switch(c.replace('#','V').toUpperCase()) {
		case 'V':Bg.strokeLine(x+HT+lo, y, x+HT+lo, y+T);break
		case 'H':Bg.strokeLine(x, y+HT+lo, x+T, y+HT+lo);break
		}

		[/[A-D]/,/[A-D]/,/[a-d1-4]/,/[a-d]/,/[5-8]/].forEach(
			(r,i)=> r.test(c) && Wall.#drawCorner({type:i,ci,x,y}))

		Bg.save()
		if (c == '#' || (!tx || tx == W-1) && n) {
			Bg.translate(x+(tx<W/2 ? OO:T-OO), y)
			Bg.strokeLine(0,0,0,T)
		}
		if (/[_=]/.test(c) || Maze.isTopOrBottom(ty) && n) {
			const oY = /[=56]/.test(c) ? OO:T-OO
			Bg.translate(x, y)
			Bg.strokeLine(0, oY, T, oY)
			!n && Bg.strokeLine(0, HT+lo, T, HT+lo)
		}
		Bg.restore()
	}
}
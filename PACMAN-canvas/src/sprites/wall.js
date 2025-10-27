const {ctx}= Bg, W = Cols
const OO = 2 // Outer Offset
const LO = 3 // Line Offset
const LW = 3 // Line Width

import {Maze} from '../maze.js'
export const Wall = new class {
	draw(color=Color.Wall) {
		ctx.clear()
		ctx.lineWidth   = LW
		ctx.strokeStyle = color
		Maze.Map.forEach(this.#drawTile)
		this.#drawHouse()
	}
	#drawHouse() {
		const [ix,iy,ox,oy]= [31,16,34,19].map(n=>n/10*T)
		ctx.save()
		ctx.translate(BW/2, Maze.House.MiddleY)
		ctx.strokeRect(-ox, -oy, ox*2, oy*2)
		ctx.strokeRect(-ix, -iy, ix*2, iy*2)
		ctx.clearRect (-T, -oy-LW,T*2, T/2)
		ctx.strokeLine(-T-LW/2, -oy, -T-LW/2, -iy)
		ctx.strokeLine(+T+LW/2, -oy, +T+LW/2, -iy)
		ctx.restore()
	}
	/** @param {{type:number, ci:number, x:number, y:number}} cfg */
	#drawCorner({type,ci,x,y}) {
		ctx.save()
		ctx.translate(x+T/2, y+T/2)
		ctx.rotate(ci*PI/2)
		ctx.beginPath()
		switch(type) {
		case 0: ctx.arc(T/2,T/2, T-OO,   PI,PI*3/2);break
		case 1: ctx.arc(T/2,T/2, T/2+LO, PI,PI*3/2);break
		case 2: ctx.arc(T/2,T/2, T/2-LO, PI,PI*3/2);break
		case 3: ctx.arc(T/2,T/2, OO,     PI,PI*3/2);break
		case 4:
			ctx.moveTo(-LO, T/2)
			ctx.arcTo (-LO, -LO, T/3-LO, -LO, T/3)
			ctx.lineTo(T/2, -LO)
			break
		}
		ctx.stroke()
		ctx.restore()
	}
	/**
	 * @param {string} c Tile chip
	 * @param {number} i Tile index
	 */
	#drawTile(c, i) {
		const [n,tx,ty]= [Number(c),i%W,i/W|0], [x,y]= [tx*T,ty*T]
		const ci = n? n-(n>4? 5:1):'ABCD'.indexOf(c.toUpperCase())
		const lo = (c == '#' && tx<W/2) || /[VH=]/.test(c)? -LO:LO

		switch(c.toUpperCase()) {
		case '#':
		case 'V':ctx.strokeLine(x+T/2+lo, y, x+T/2+lo, y+T);break
		case 'H':ctx.strokeLine(x, y+T/2+lo, x+T, y+T/2+lo);break
		}
		;[/[A-D]/,/[A-D]/,/[a-d1-4]/,/[a-d]/,/[5-8]/].forEach(
			(r,type)=> r.test(c) && Wall.#drawCorner({type,ci,x,y}))

		ctx.save()
		if (c == '#' || (!tx || tx == W-1) && n) {
			ctx.translate(x+T/2+(tx<W/2 ? -T/2+OO : T/2-OO), y)
			ctx.strokeLine(0,0, 0,T)
		}
		if (/[_=]/.test(c) || Maze.isTopOrBottom(ty) && n) {
			const oY = /[=56]/.test(c) ? -T/2+OO : T/2-OO
			ctx.translate(x, y+T/2)
			ctx.strokeLine(0,oY, T,oY)
			!n && ctx.strokeLine(0,lo, T,lo)
		}
		ctx.restore()
	}
}
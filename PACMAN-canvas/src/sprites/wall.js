const {ctx}= Bg, W = Cols
const OO = 2 // Outer Offset
const LO = 3 // Line Offset
const LW = 3 // Line Width

import {Maze} from '../maze.js'
export const Wall = new class {
	draw(color=Color.Wall) {
		ctx.save()
		ctx.clear()
		ctx.lineWidth   = LW
		ctx.strokeStyle = color
		Maze.Map.forEach(this.#drawTile)
		this.#drawHouse()
		ctx.restore()
	}
	#drawHouse() {
		const [ix,iy,ox,oy]= [3.1, 1.6, 3.4, 1.9].map(n=>n*T)
		ctx.translate(BW/2, Maze.House.MiddleY)
		ctx.strokeRect(-ox, -oy, ox*2, oy*2)
		ctx.strokeRect(-ix, -iy, ix*2, iy*2)
		ctx.clearRect (-T, -oy-LW/2, T*2, T)
		ctx.strokeLine(-T-LW/2, -oy, -T-LW/2, -iy)
		ctx.strokeLine(+T+LW/2, -oy, +T+LW/2, -iy)
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
		const [tx,ty]=[i%W,i/W|0], [x,y]=[tx*T,ty*T], isL=(tx < W/2)
		const lo = (c=='#' && isL)||(c=='=')||/[HV]/.test(c)? -LO:LO
		switch(c.toUpperCase()) {
		case '#':
		case 'V':ctx.strokeLine(x+T/2+lo, y, x+T/2+lo, y+T);break
		case 'H':ctx.strokeLine(x, y+T/2+lo, x+T, y+T/2+lo);break
		}
		ctx.save()
		{
			const ci = +c? +c-(+c>4 ? 5:1):'ABCD'.search(c.toUpperCase())
			;[/[A-D]/,/[A-D]/,/[a-d1-4]/,/[a-d]/,/[5-8]/].forEach(
				(r,type)=> r.test(c) && Wall.#drawCorner({type,ci,x,y}))
		}
		if (c == '#' || (tx == 0 || tx == W-1) && +c) {
			ctx.translate(x+T/2+(isL? -T/2+OO:T/2-OO), y)
			ctx.strokeLine(0,0, 0,T)
		}
		if (/[_=]/.test(c) || Maze.isTopOrBottom(ty) && +c) {
			const oY = /[=56]/.test(c)? -T/2+OO:T/2-OO
			ctx.translate(x, y+T/2)
			ctx.strokeLine(0,oY, T,oY)
			!+c && ctx.strokeLine(0,lo, T,lo)
		}
		ctx.restore()
	}
}
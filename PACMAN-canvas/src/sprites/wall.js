const {ctx}= Bg, W = Cols
const OO = 2 // Outer Offset
const LO = 2 // Line Offset
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
		const [hl,ix,iy,ox,oy]= [LW/2, 3.1, 1.6, 3.4, 1.9]
		ctx.translate(BW/2, Maze.House.MiddleY)
		ctx.newLinePath(
			[-T-hl, -oy*T],[-ox*T, -oy*T],[-ox*T, +oy*T],
			[+ox*T, +oy*T],[+ox*T, -oy*T],[+T+hl, -oy*T],
			[+T+hl, -iy*T],[+ix*T, -iy*T],[+ix*T, +iy*T],
			[-ix*T, +iy*T],[-ix*T, -iy*T],[-T-hl, -iy*T])
		ctx.closePath()
		ctx.stroke()
	}
	/** @param {{type:number, ci:number, c:string, x:number, y:number}} cfg */
	#drawCorner({type,ci,c,x,y}) {
		ctx.save()
		ctx.translate(x+T/2, y+T/2)
		ctx.rotate(ci*PI/2)
		ctx.beginPath()
		switch(type) {
		case 0: /[A-D5-8]/.test(c)
		     ? ctx.arc(T/2,T/2, T/2+LO, PI,PI*3/2)
		     : ctx.arc(T/2,T/2, T/2-LO, PI,PI*3/2);break
		case 1:ctx.arc(T/2,T/2, OO,     PI,PI*3/2);break
		case 2:ctx.arc(T/2,T/2, T-OO,   PI,PI*3/2);break
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
		const ci = +c? +c-(+c>4? 5:1):'ABCD'.search(c.toUpperCase())
		const lo = c=='#' && isL || c=='=' || /[HV]/.test(c)? -LO:LO

		;/[a-d\d]/i.test(c) && Wall.#drawCorner({type:0,ci,c,x,y})
		;/[a-d]/   .test(c) && Wall.#drawCorner({type:1,ci,c,x,y})
		;/[A-D]/   .test(c) && Wall.#drawCorner({type:2,ci,c,x,y})

		switch(c.toUpperCase()) {
		case '#':
		case 'V':ctx.strokeLine(x+T/2+lo, y, x+T/2+lo, y+T);break
		case 'H':ctx.strokeLine(x, y+T/2+lo, x+T, y+T/2+lo);break
		}
		ctx.save()
		if (c=='#' || (!tx || tx == W-1) && +c) {
			ctx.translate(x+T/2+(isL? -T/2+OO : T/2-OO), y)
			ctx.strokeLine(0,0, 0,T)
		}
		if (/[_=]/.test(c) || Maze.isTopOrBottom(ty) && +c) {
			const oY = /[=56]/.test(c)? -T/2+OO : T/2-OO
			ctx.translate(x, y+T/2)
			ctx.strokeLine(0,oY, T,oY)
			!+c && ctx.strokeLine(0,lo, T,lo)
		}
		ctx.restore()
	}
}
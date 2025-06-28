const {ctx}= Bg
const W  = Cols
const OO = 2 // Outer Offset
const LO = 2 // Line Offset
const LW = 3 // Line Width

/** @type {xy2dListAsConst} */
const CornerScales = [[1,1], [-1,1], [-1,-1], [1,-1]]

import {Maze} from '../maze.js'
export const Wall = new class {
	draw(color=Color.Wall) {
		ctx.save()
		ctx.clear()
		ctx.lineWidth   = LW
		ctx.strokeStyle = color
		Maze.Map.forEach(this.#drawTile.bind(this))
		this.#drawHouse()
		ctx.restore()
	}
	#drawHouse() {
		const o = LW/2
		ctx.translate(CW/2, Maze.House.MiddleY)
		ctx.newLinePath(
			[-1.0*T-o, -1.9*T],[-3.4*T, -1.9*T],[-3.4*T,    1.9*T],
			[ 3.4*T,    1.9*T],[ 3.4*T, -1.9*T],[ 1.0*T+o, -1.9*T],
			[ 1.0*T+o, -1.6*T],[ 3.1*T, -1.6*T],[ 3.1*T,    1.6*T],
			[-3.1*T,    1.6*T],[-3.1*T, -1.6*T],[-1.0*T-o, -1.6*T])
		ctx.closePath()
		ctx.stroke()
	}
	/**
	 * @param {number} type
	 * @param {{cn:number, c:string, x:number, y:number}} cfg
	 */
	#drawCorner(type, {cn,c,x,y}) {
		ctx.save()
		ctx.translate(x+T/2, y+T/2)
		ctx.scale(...CornerScales[cn>3 ? cn-4:cn])
		ctx.beginPath()
		match(type, {
			0:()=> /[A-D5-8]/.test(c)
			     ? ctx.arc(T/2,T/2, T/2+LO, PI,PI*1.5)
			     : ctx.arc(T/2,T/2, T/2-LO, PI,PI*1.5),
			1:()=> ctx.arc(T/2,T/2, OO,     PI,PI*1.5),
			2:()=> ctx.arc(T/2,T/2, T-OO,   PI,PI*1.5),
		})
		ctx.stroke()
		ctx.restore()
	}
	/**
	 * @param {string} c Tile chip
	 * @param {number} i Tile index
	 */
	#drawTile(c, i) {
		const [tx,ty]=[i%W,i/W|0], [x,y]=[tx*T,ty*T], isL=(tx < W/2)
		const cn   = +c? +c-1 : 'ABCD'.indexOf(c.toUpperCase())
		const ofst = /[HV]/.test(c) || (c=='#' && isL) ? -LO:LO

		;/[a-d\d]/i.test(c) && this.#drawCorner(0,{cn,c,x,y})
		;/[a-d]/   .test(c) && this.#drawCorner(1,{cn,c,x,y})
		;/[A-D]/   .test(c) && this.#drawCorner(2,{cn,c,x,y})

		match(c, {
			h_H:()=> ctx.strokeLine(x, y+T/2+ofst, x+T, y+T/2+ofst),
			v_V:()=> ctx.strokeLine(x+T/2+ofst, y, x+T/2+ofst, y+T),
			'#':()=> ctx.strokeLine(x+T/2+ofst, y, x+T/2+ofst, y+T),
		})

		ctx.save()
		if (c=='#' || (!tx || tx == W-1) && +c) {
			ctx.translate(x+(isL? -T/2+OO : T/2-OO)+T/2, y)
			ctx.strokeLine(0,0, 0,T)
		}
		if (/[_=]/.test(c) || ty == 1 && +c) {
			const oY1 = /[=56]/.test(c) ? -T/2+OO : T/2-OO
			const oY2 = (c=='=') ? -LO:LO
			ctx.translate(x, y+T/2)
			ctx.strokeLine(0,oY1, T,oY1)
			!+c && ctx.strokeLine(0,oY2, T,oY2)
		}
		ctx.restore()
	}
}
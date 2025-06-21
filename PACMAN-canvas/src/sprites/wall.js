const {ctx}= Bg
const ScaleTable = /**@type {readonly xyList[]}*/(
	[[1,1],[-1,1],[-1,-1],[1,-1]]
)

import {Maze} from '../maze.js'
export const Wall = new class {
	draw(color=Color.Wall) {
		ctx.save()
		ctx.clear()
		ctx.lineWidth   = 3
		ctx.strokeStyle = color
		Maze.Map.forEach(this.#drawTile)
		this.#drawHouse(ctx.lineWidth/2)
		ctx.restore()
	}
	#drawHouse(hl=0) {
		ctx.newLinePath(
			[13.00*T-hl,13.55*T],[10.55*T, 13.55*T],[10.55*T,   17.45*T],
			[17.45*T,   17.45*T],[17.45*T, 13.55*T],[15.00*T+hl,13.55*T],
			[15.00*T+hl,13.90*T],[17.10*T, 13.90*T],[17.10*T,   17.10*T],
			[10.90*T,   17.10*T],[10.90*T, 13.90*T],[13.00*T-hl,13.90*T])
		ctx.closePath()
		ctx.stroke()
	}

	/** @param {{ci:number, x:number, y:number, type:number}} param */
	#drawCorner({ci, x,y, type}) {
		ctx.save()
		ctx.translate(x+T/2, y+T/2)
		ctx.scale(...ScaleTable[ci])
		ctx.beginPath()
		;(type == 2)
			? ctx.strokeLine(T/2,T/2, T/2-2,T/2-2)
			: ctx.arc(T/2,T/2, (type? T-2:T/2), PI,PI*1.5)
		ctx.stroke()
		ctx.restore()
	}

	/**
	 * @param {string} c Map chip
	 * @param {number} i Tile index
	 */
	#drawTile(c, i) {
		const [tx,ty]=[i%Cols,i/Cols|0], [x,y]=[tx*T,ty*T]
		const ci = +c? +c-1 : 'ABCD'.indexOf(c.toUpperCase())

		;/[A-D]/.test(c)    && Wall.#drawCorner({ci, x,y, type:1})
		;/[a-d]/.test(c)    && Wall.#drawCorner({ci, x,y, type:2})
		;/[a-d\d]/i.test(c) && Wall.#drawCorner({ci, x,y, type:0})

		;(c == '-')     && ctx.strokeLine(x, y+T/2, x+T, y+T/2)
		;/[#|]/.test(c) && ctx.strokeLine(x+T/2, y, x+T/2, y+T)

		ctx.save()
		if (c == '#' || (!tx || tx == Cols-1) && +c) {
			const oX = tx < Cols/2 ? -T/2+2 : T/2-2
			ctx.translate(x+oX+T/2, y)
			ctx.strokeLine(0,0, 0,T)
		}
		if (/[=_]/.test(c) || ty == 1 && +c) {
			const oY = /[=12]/.test(c) ? -T/2+2 : T/2-2
			ctx.translate(x, y+T/2)
			ctx.strokeLine(0,oY, T,oY)
			!+c && ctx.strokeLine(0,0, T,0)
		}
		ctx.restore()
	}
}
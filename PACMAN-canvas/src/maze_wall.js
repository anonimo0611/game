const {ctx}= Bg, W = Cols

import {Maze} from './maze.js'
export const MazeWall = new class {
	#drawCorner(cornerIdx, x, y, type=0) {
		ctx.save()
		ctx.translate(x+T/2, y+T/2)
		ctx.scale(...[[1,1],[-1,1],[-1,-1],[1,-1]][cornerIdx])
		ctx.beginPath()
		;(type == 2)
			? ctx.strokeLine(T/2,T/2, T/2-2,T/2-2)
			: ctx.arc(T/2,T/2, (type? T-2:T/2), PI,PI*1.5)
		ctx.stroke()
		ctx.restore()
	}
	#drawHouse(lh=0) {
		ctx.newLinePath(
			[13.00*T-lh,13.55*T],[10.55*T, 13.55*T],[10.55*T,   17.45*T],
			[17.45*T,   17.45*T],[17.45*T, 13.55*T],[15.00*T+lh,13.55*T],
			[15.00*T+lh,13.90*T],[17.10*T, 13.90*T],[17.10*T,   17.10*T],
			[10.90*T,   17.10*T],[10.90*T, 13.90*T],[13.00*T-lh,13.90*T])
		ctx.closePath()
		ctx.stroke()
	}
	draw(color=Color.Wall) {
		ctx.save()
		ctx.clearRect(0,0, CvsW, CvsH-T*2)
		ctx.lineWidth   = 3.5
		ctx.strokeStyle = color
		Maze.Map.forEach(this.#drawTile)
		this.#drawHouse(ctx.lineWidth/2)
		ctx.restore()
	}
	#drawTile = (c, i)=> {
		const [tx,ty]= [i%W, i/W|0]
		const [px,py]= [tx*T, ty*T]
		const ci = +c? c-1 : 'ABCD'.indexOf(c.toUpperCase())

		;/[A-D]/.test(c) && this.#drawCorner(ci, px, py, 1)
		;/[a-d]/.test(c) && this.#drawCorner(ci, px, py, 2)
		;/[a-d1-4]/i.test(c) && this.#drawCorner(ci, px, py)

		;(c == '-')     && ctx.strokeLine(px, py+T/2, px+T, py+T/2)
		;/[#|]/.test(c) && ctx.strokeLine(px+T/2, py, px+T/2, py+T)

		ctx.save()
		if (c == '#' || (!tx || tx == W-1) && +c) {
			const oX = tx < W/2 ? -T/2+2 : T/2-2
			ctx.translate(px+oX+T/2, py)
			ctx.strokeLine(0,0, 0,T)
		}
		if (/[=_]/.test(c) || ty == 1 && +c) {
			const oY = /[=12]/.test(c) ? -T/2+2 : T/2-2
			ctx.translate(px, py+T/2)
			ctx.strokeLine(0,oY, T,oY)
			!+c && ctx.strokeLine(0,0, T,0)
		}
		ctx.restore()
	}
};MazeWall.draw()
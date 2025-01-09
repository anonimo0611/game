import {BgCvs,BgCtx as ctx}   from './_canvas.js'
import {LineW,TileSize as T}  from './_constants.js'
import {MapData,Color,ColMax} from './_constants.js'

export const MazeWall = new class {
	#drawCorner(cornerIdx, x, y, outer=0) {
		ctx.save()
		ctx.translate(x+T/2, y+T/2)
		ctx.scale(...[[1,1],[-1,1],[-1,-1],[1,-1]][cornerIdx])
		ctx.beginPath()
		ctx.arc(T/2, T/2, T/(outer?1:2), PI, PI*1.5)
		ctx.stroke()
		ctx.restore()
	}
	#drawGhostPen() {
		const lw = ctx.lineWidth
		cvsSetNewLinePath(ctx)(
		[13.0*T-lw/2, 13.5*T],[10.5*T, 13.5*T],[10.5*T,      17.5*T],
		[17.5*T,      17.5*T],[17.5*T, 13.5*T],[15.0*T+lw/2, 13.5*T],
		[15.0*T+lw/2, 13.9*T],[17.1*T, 13.9*T],[17.1*T,      17.1*T],
		[10.9*T,      17.1*T],[10.9*T, 13.9*T],[13.0*T-lw/2, 13.9*T])
		ctx.closePath()
		ctx.stroke()
	}
	draw(color=Color.Wall) {
		ctx.save()
		ctx.clear(-LineW, 0, BgCvs.width, BgCvs.height - T*2 + LineW)
		ctx.lineWidth   = LineW
		ctx.strokeStyle = color
		MapData.forEach(this.#drawTile)
		this.#drawGhostPen()
		ctx.restore()
	}
	#drawTile = (tipStr, idx)=> {
		const tip = toNumber(tipStr)
		const [tx,ty]= [idx%ColMax, idx/ColMax|0]
		const [px,py]= [tx*T,ty*T], C = ColMax-1

		if (/[ABCD]/.test(tip))
			for (let i=0; i<=1; i++)
				this.#drawCorner('ABCD'.indexOf(tip), px, py, i)

		if (/[1234]/.test(tip))
			this.#drawCorner(tip-1, px, py)

		if (tip == '|' || tip == '#')
			cvsStrokeLine(ctx)(px+T/2, py, px+T/2, py+T)

		if (tip == '-')
			cvsStrokeLine(ctx)(px, py+T/2, px+T, py+T/2)

		if (tip == '#' || (tx == 0 || tx == C) && isNum(tip)) {
			const oX = tx < C/2 ? -T/2 : T/2
			cvsStrokeLine(ctx)(px+T/2+oX, py, px+T/2+oX, py+T)
		}
		if (tip == '=' || tip == '_' ||  ty == 1 && isNum(tip)) {
			const oY  = /[=12]/.test(tip) ? -T/2 : T/2
			const stX = (tx == 0 ? -LineW : 0)
			const edX = (tx == C ? +LineW : 0)+T
			ctx.save()
			ctx.translate(px, py+T/2)
			cvsStrokeLine(ctx)(stX, oY, edX, oY)
			!isNum(tip) && cvsStrokeLine(ctx)(stX, 0, edX, 0)
			ctx.restore()
		}
	}
};MazeWall.draw()
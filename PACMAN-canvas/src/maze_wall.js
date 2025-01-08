import {Vec2} from '../_lib/vec2.js'
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
	#drawTile = (tStr, idx)=> {
		const tip = toNumber(tStr), C = ColMax-1
		const {x, y}= Vec2.fromIdx(idx, ColMax)

		if (/[ABCD]/.test(tip)) {
			const cornerIdx = 'ABCD'.indexOf(tip)
			for (let i=0; i<=1; i++)
				this.#drawCorner(cornerIdx, x*T, y*T, i)
		}
		if (/[1234]/.test(tip))
			this.#drawCorner(tip-1, x*T, y*T)

		if (tip == '|' || tip == '#')
			cvsStrokeLine(ctx)(x*T+T/2, y*T, x*T+T/2, y*T+T)

		if (tip == '-')
			cvsStrokeLine(ctx)(x*T, y*T+T/2, x*T+T, y*T+T/2)

		if (tip == '#' || (x == 0 || x == C) && isNum(tip)) {
			const oX = x < C/2 ? -T/2 : T/2
			cvsStrokeLine(ctx)(x*T+T/2+oX, y*T, x*T+T/2+oX, y*T+T)
		}
		if (tip == '=' || tip == '_' ||  y == 1 && isNum(tip)) {
			const oY  = /[=12]/.test(tip) ? -T/2 : T/2
			const stX = (x == 0 ? -LineW : 0)
			const edX = (x == C ? +LineW : 0)+T
			ctx.save()
			ctx.translate(x*T, y*T+T/2)
			cvsStrokeLine(ctx)(stX, oY, edX, oY)
			!isNum(tip) && cvsStrokeLine(ctx)(stX, 0, edX, 0)
			ctx.restore()
		}
	}
};MazeWall.draw()
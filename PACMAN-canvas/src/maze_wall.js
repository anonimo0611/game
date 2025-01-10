import {BgCvs,BgCtx as ctx} from './_canvas.js'
import * as Constant from './_constants.js'
const {MapData,Color,TileSize:T,ColMax:W}= Constant

export const MazeWall = new class {
	#drawCorner(chip, x, y, type=0) {
		const idx = isNum(chip)
			? chip-1 : 'ABCD'.indexOf(chip.toUpperCase())
		ctx.save()
		ctx.translate(x+T/2, y+T/2)
		ctx.scale(...[[1,1],[-1,1],[-1,-1],[1,-1]][idx])
		ctx.beginPath()
		type == 2
			? cvsStrokeLine(ctx)(T/2,T/2, T/2-2,T/2-2)
			: ctx.arc(T/2, T/2, (type? T-2:T/2), PI, PI*1.5)
		ctx.stroke()
		ctx.restore()
	}
	#drawGhostPen() {
		const LH = ctx.lineWidth/2
		cvsSetNewLinePath(ctx)(
		[13.00*T-LH, 13.55*T],[10.55*T, 13.55*T],[10.55*T,    17.45*T],
		[17.45*T,    17.45*T],[17.45*T, 13.55*T],[15.00*T+LH, 13.55*T],
		[15.00*T+LH, 13.90*T],[17.10*T, 13.90*T],[17.10*T,    17.10*T],
		[10.90*T,    17.10*T],[10.90*T, 13.90*T],[13.00*T-LH, 13.90*T])
		ctx.closePath()
		ctx.stroke()
	}
	draw(color=Color.Wall) {
		ctx.save()
		ctx.clear(0,0, BgCvs.width, BgCvs.height-T*2)
		ctx.lineWidth   = 3
		ctx.strokeStyle = color
		MapData.forEach(this.#drawTile)
		this.#drawGhostPen()
		ctx.restore()
	}
	#drawTile = (chipStr, idx)=> {
		const chip = toNumber(chipStr)
		const [tx,ty]= [idx%W, idx/W|0]
		const [px,py]= [tx*T, ty*T]

		;/[ABCD]/.test(chip) && this.#drawCorner(chip, px, py, 1)
		;/[abcd]/.test(chip) && this.#drawCorner(chip, px, py, 2)
		;/[ABCD1234]/i.test(chip) && this.#drawCorner(chip, px, py)

		;(chip == '-')     && cvsStrokeLine(ctx)(px, py+T/2, px+T, py+T/2)
		;/[#|]/.test(chip) && cvsStrokeLine(ctx)(px+T/2, py, px+T/2, py+T)

		if (chip == '#' || (!tx || tx == W-1) && isNum(chip)) {
			const oX = tx < W/2 ? -T/2+2 : T/2-2
			cvsStrokeLine(ctx)(px+T/2+oX, py, px+T/2+oX, py+T)
		}
		if (/[=_]/.test(chip) || ty == 1 && isNum(chip)) {
			const oY  = /[=12]/.test(chip) ? -T/2+2 : T/2-2
			ctx.save()
			ctx.translate(px, py+T/2)
			cvsStrokeLine(ctx)(0, oY, T, oY)
			!isNum(chip) && cvsStrokeLine(ctx)(0, 0, T, 0)
			ctx.restore()
		}
	}
};MazeWall.draw()
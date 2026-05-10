const HT = T/2
const LW = max(1, 3*SF|0) // Line  Width
const LO = max(2, 4*SF|0) // Line  Offset
const OO = max(1, 2*SF|0) // Outer Offset

const Ctxs = freeze({
	Blue:  canvas2D(null, BW,BH).ctx,
	White: canvas2D(null, BW,BH).ctx,
})
const Corner = /**@type {const}*/({
	toIndex: cyclicIndexMap('12345678abcdABCD', 4),
	Type:    {Standard:0, LTShape:1, Outer:2, Pocket:3},
	RegExps: [/[1-4]/,/[5-8]/,/[A-D]/,/[a-d]/],
})

import {State} from '../state.js'
import {Maze}  from '../maze.js'
export const Wall = new class WallRenderer {
	static {$(this.cache)}
	static cache() {
		values(Ctxs).forEach((ctx,i)=> {
			ctx.lineWidth   = LW
			ctx.strokeStyle = Color.MazeWalls[i]
			Maze.Map.forEach((s,i)=> {
				if (i%COLS >= COLS/2) return
				Wall.#drawTile(ctx, s, i%COLS, i/COLS|0)
			})
			ctx.flip(ctx.canvas, 0,0, true)
			Wall.#drawHouse(ctx)
		})
	}
	draw(ctx=Ctxs.Blue) {
		Bg.clear()
		Bg.drawImage(ctx.canvas, 0,0)
		Wall.#drawDoor()
	}
	setFlashing(cb=()=>{}) {
		let cnt = 0
		;(function redraw() {
			if (++cnt > 8) return Timer.set(500, cb)
			Wall.draw(cnt % 2 ? Ctxs.White : Ctxs.Blue)
			Timer.set(250, redraw)
		})()
	}
	#drawDoor() {
		if (State.isFlashing) return
		const y = (Maze.House.EntryTile.y+1.6)*T
		Bg.fillRect(BW/2-T, y, T*2, T/4, Color.HouseDoor)
	}
	/** @param {EnhancedCtx2D} ctx */
	#drawHouse(ctx) {
		const [ix,iy,ox,oy]= [31,16,34,19].map(n=>n/10*T)
		ctx.save()
		ctx.translate(BW/2, Maze.House.MID_Y)
		ctx.strokeRect(-ox, -oy, ox*2, oy*2)
		ctx.strokeRect(-ix, -iy, ix*2, iy*2)
		ctx.clearRect (-T, -oy-LW, T*2, HT)
		ctx.strokeLine(-T-LW/2, -oy, -T-LW/2, -iy)
		ctx.strokeLine(+T+LW/2, -oy, +T+LW/2, -iy)
		ctx.restore()
	}
	/**
	 @param {EnhancedCtx2D} ctx
	 @param {{type:number, ci:number, pos:Position}} _
	*/
	#drawCorner(ctx, {type,ci,pos:{x,y}}) {
		const {Type}= Corner, radii = []
		ctx.save()
		ctx.translate(x+HT, y+HT)
		ctx.rotate(ci*PI/2)
		switch(type) {
		case Type.Outer:    radii.push(T-OO, HT+LO);break
		case Type.Standard: radii.push(HT-LO);      break
		case Type.Pocket:   radii.push(HT-LO, OO);  break
		case Type.LTShape:
			ctx.beginPath()
			ctx.moveTo(-LO,  HT)
			ctx.arcTo (-LO, -LO, T/3-LO, -LO, T/3)
			ctx.lineTo( HT, -LO)
			ctx.stroke()
		}
		for (const r of radii) {
			ctx.beginPath()
			ctx.arc(HT,HT, r, PI,-PI/2)
			ctx.stroke()
		}
		ctx.restore()
	}
	/**
	 @param {EnhancedCtx2D} ctx
	 @param {string} s  Tile symbol
	 @param {number} tx Tile col
	 @param {number} ty Tile row
	*/
	#drawTile(ctx, s, tx, ty) {
		const lo = s == '#' || /[VH=]/.test(s) ? -LO : +LO
		const ci = Corner.toIndex.get(s) ?? -1, [x,y]=[tx*T,ty*T]

		switch(s.replace('#','V').toUpperCase()) {
		case 'V': ctx.strokeLine(x+HT+lo, y, x+HT+lo, y+T);break
		case 'H': ctx.strokeLine(x, y+HT+lo, x+T, y+HT+lo);break
		}
		if (ci >= 0) {
			const type = Corner.RegExps.findIndex(c=> c.test(s))
			Wall.#drawCorner(ctx,{type,ci,pos:{x,y}})
		}
		if (s == '#' || tx == 0 && +s) {
			ctx.strokeLine(x+OO, y, x+OO, y+T)
			return
		}
		if (/[_=]/.test(s) || Maze.isTopOrBottom(ty) && +s) {
			const oY = /[=56]/.test(s) ? OO : T-OO
			ctx.strokeLine(x, y+oY, x+T, y+oY)
			isNaN(+s) && ctx.strokeLine(x, y+HT+lo, x+T, y+HT+lo)
		}
	}
}
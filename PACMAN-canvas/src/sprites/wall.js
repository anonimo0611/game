const HT = TS/2
const SF = screen.height/1080 // Scale Factor
const LW = max(1, int(3*SF))  // Line  Width
const LO = max(2, int(4*SF))  // Line  Offset
const OO = max(1, int(2*SF))  // Outer Offset

const Ctxs = freeze({
	Blue:  canvas2D(null, BW,BH).ctx,
	White: canvas2D(null, BW,BH).ctx,
})
const Corner = /**@type {const}*/({
	toIndex: cyclicIndexMap('12345678abcdABCD', 4),
	Type:    {Convex:0, Concave:1, Outer:2, Pocket:3},
	RegExps: [/[1-4]/,/[5-8]/,/[A-D]/,/[a-d]/],
})

import {State} from '../state.js'
import {Maze}  from '../maze.js'
export const Wall = new class WallRenderer {
	static {$(this.cache)}
	static cache() {
		getVals(Ctxs).forEach((ctx,i)=> {
			ctx.lineWidth   = LW
			ctx.strokeStyle = Color.MazeWalls[i]
			Maze.Map.forEach((s,i)=> {
				if (i%COLS >= COLS/2) return
				Wall.#drawTile(ctx, s, i%COLS, i/COLS|0)
			})
			ctx.put(ctx.canvas, Vec2.Zero, 1, 0, -1,1, -BW,0)
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
			Timer.set(235, redraw)
		})()
	}
	#drawDoor() {
		if (State.isFlashing) return
		const y = (Maze.House.EntryTile.y+1.6)*TS
		Bg.fillRect(BW/2-TS, y, TS*2, TS/4, Color.HouseDoor)
	}

	/** @param {Ctx2D} ctx */
	#drawHouse(ctx) {
		const [ix,iy,ox,oy]= [31,16,34,19].map(n=>n/10*TS)
		ctx.save()
		ctx.translate(BW/2, Maze.House.MID_Y)
		ctx.strokeRect(-ox, -oy, ox*2, oy*2)
		ctx.strokeRect(-ix, -iy, ix*2, iy*2)
		ctx.clearRect (-TS, -oy-LW, TS*2, HT)
		ctx.strokeLine(-TS-LW/2, -oy, -TS-LW/2, -iy)
		ctx.strokeLine(+TS+LW/2, -oy, +TS+LW/2, -iy)
		ctx.restore()
	}

	/**
	 * @param {Ctx2D} ctx
	 * @param {{type:number, cIdx:number, pos:Pos}} _
	 */
	#drawCorner(ctx, {type,cIdx,pos:{x,y}}) {
		const {Type}= Corner, radii = []
		ctx.save()
		ctx.translate(x+HT, y+HT)
		ctx.rotate(cIdx*PI/2)
		switch(type) {
		case Type.Outer:  radii.push(HT+LO,TS-OO);break
		case Type.Convex: radii.push(HT-LO);     break
		case Type.Pocket: radii.push(HT-LO,OO);  break
		case Type.Concave:
			ctx.beginPath()
			ctx.moveTo(-LO,  HT)
			ctx.arcTo (-LO, -LO, TS/3, -LO, TS/3)
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
	 * @param {Ctx2D}  ctx
	 * @param {string} s  Tile symbol
	 * @param {number} tx Tile col
	 * @param {number} ty Tile row
	 */
	#drawTile(ctx, s, tx, ty) {
		const ofst = /[#VH=]/.test(s) ? -LO : +LO
		const cIdx = Corner.toIndex.get(s) ?? -1
		const [x,y]= [tx*TS,ty*TS]

		switch(s.toUpperCase()) {
		case '#':
		case 'V': ctx.strokeLine(x+HT+ofst, y, x+HT+ofst, y+TS);break
		case 'H': ctx.strokeLine(x, y+HT+ofst, x+TS, y+HT+ofst);break
		}
		if (cIdx >= 0) {
			const type = Corner.RegExps.findIndex(c=> c.test(s))
			Wall.#drawCorner(ctx,{type,cIdx,pos:{x,y}})
		}
		if (s == '#' || tx == 0 && +s) {
			ctx.strokeLine(x+OO, y, x+OO, y+TS)
			return
		}
		if (/[_=]/.test(s) || Maze.isTopOrBottom(ty) && +s) {
			const oY = /[=56]/.test(s) ? OO : TS-OO
			ctx.strokeLine(x, y+oY, x+TS, y+oY)
			!+s && ctx.strokeLine(x, y+HT+ofst, x+TS, y+HT+ofst)
		}
	}
}
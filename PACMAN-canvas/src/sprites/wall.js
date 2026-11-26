const HC = COLS/2|0
const HT = TILE_SIZE/2
const SF = screen.height/1080 // Scale Factor
const LW = max(1, 3*SF|0)  // Line  Width
const LO = max(2, 4*SF|0)  // Line  Offset
const OO = max(1, 2*SF|0)  // Outer Offset

const Ctxs = freeze({
	Blue:  canvas2D(null, BW,BH).ctx,
	White: canvas2D(null, BW,BH).ctx,
})
const Corner = /**@type {const}*/({
	Chars: '12345678abcdABCD',
	Type: {Convex:0, Concave:1, Pocket:2, Outer:3, Max:4},
})

import {State} from '../state.js'
import {Maze}  from '../maze.js'
export const Wall = new class WallRenderer {
	static {$(this.cache)}
	static cache() {
		getVals(Ctxs).forEach((ctx,i)=> {
			ctx.lineWidth   = LW
			ctx.strokeStyle = Color.MazeWalls[i]
			for (let i=0; i<HC*ROWS; i++)
				Wall.#drawTile(ctx, i%HC, i/HC|0)
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
		case Type.Convex: radii.push(HT-LO);      break
		case Type.Pocket: radii.push(HT-LO,OO);   break
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
	 * @param {number} col
	 * @param {number} row
	 */
	#drawTile(ctx, col, row) {
		const [x,y]= [col*TS, row*TS]
		const char = Maze.Map[row*COLS+col]
		const ofst = /[#VH=]/.test(char) ? -LO : +LO
		const rIdx = Corner.Chars.indexOf(char)

		switch(char.toUpperCase()) {
		case '#':
		case 'V': ctx.strokeLine(x+HT+ofst, y, x+HT+ofst, y+TS);break
		case 'H': ctx.strokeLine(x, y+HT+ofst, x+TS, y+HT+ofst);break
		}
		if (rIdx >= 0) {
			const i = rIdx, {Max:m}= Corner.Type
			Wall.#drawCorner(ctx, {cIdx:i%m,type:i/m|0,pos:{x,y}})
		}
		if (char == '#' || col == 0 && +char) {
			ctx.strokeLine(x+OO, y, x+OO, y+TS)
			return
		}
		if (/[_=]/.test(char) || Maze.isTopOrBottom(row) && +char) {
			const oY = /[=56]/.test(char) ? OO : TS-OO
			ctx.strokeLine(x, y+oY, x+TS, y+oY)
			!+char && ctx.strokeLine(x, y+HT+ofst, x+TS, y+HT+ofst)
		}
	}
}
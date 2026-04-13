const HT = T/2
const SF = screen.height/1080
const LW = max(1, 3*SF|0) // Line  Width
const LO = max(2, 4*SF|0) // Line  Offset
const OO = max(1, 2*SF|0) // Outer Offset
const CornerToIdx = new Map(Array.from('12345678abcdABCD',(v,i)=> [v,i%4]))

const Cache = freeze([
	canvas2D(null, BW,BH).ctx, // Blue
	canvas2D(null, BW,BH).ctx  // White
])

import {State} from '../state.js'
import {Maze}  from '../maze.js'
export const Wall = new class WallRenderer {
	static {$(this.cache)}
	static cache() {
		Cache.forEach((ctx,i)=> {
			ctx.lineWidth   = LW
			ctx.strokeStyle = Palette.Wall[i];
			Maze.Map.forEach((_,j)=> {
				if (j%Cols >= Cols/2) return
				Wall.#drawTile(ctx, Maze.Map[j], j)
			})
			ctx.flip(ctx.canvas, 0,0, true)
			Wall.#drawHouse(ctx)
		})
	}
	draw(idx=0) {
		Bg.clear()
		Bg.drawImage(Cache[idx].canvas, 0,0)
		Wall.#drawDoor()
	}
	setFlashing(cb=()=>{}) {
		let cnt = 0
		;(function redraw() {
			if (++cnt > 8) return Timer.set(500, cb)
			Wall.draw(cnt % 2 ? 1:0)
			Timer.set(250, redraw)
		})()
	}
	#drawDoor() {
		if (State.isFlashing) return
		const y = (Maze.House.EntryTile.y+1.6)*T
		Bg.fillRect(BW/2-T, y, T*2, T/4, Color.Door)
	}
	/** @param {EnhancedCtx2D} ctx */
	#drawHouse(/**@type {EnhancedCtx2D}*/ctx) {
		const [ix,iy,ox,oy]= [31,16,34,19].map(n=>n/10*T)
		ctx.save()
		ctx.translate(BW/2, Maze.House.MidY)
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
		ctx.save()
		ctx.translate(x+HT, y+HT)
		ctx.rotate(ci*PI/2)
		ctx.beginPath()
		switch(type) {
		case 0: ctx.arc(HT,HT, T-OO,  PI,-PI/2);break
		case 1: ctx.arc(HT,HT, HT+LO, PI,-PI/2);break
		case 2: ctx.arc(HT,HT, HT-LO, PI,-PI/2);break
		case 3: ctx.arc(HT,HT, OO,    PI,-PI/2);break
		case 4:
			ctx.moveTo(-LO,  HT)
			ctx.arcTo (-LO, -LO, T/3-LO, -LO, T/3)
			ctx.lineTo( HT, -LO)
			break
		}
		ctx.stroke()
		ctx.restore()
	}
	/**
	 @param {EnhancedCtx2D} ctx
	 @param {string} c Tile chip
	 @param {number} i Tile index
	*/
	#drawTile(ctx, c, i) {
		const t  = {x:i%Cols, y:i/Cols|0}, {x,y}= Vec2.mul(t,T)
		const lo = c == '#' || /[VH=]/.test(c) ? -LO:LO

		;[/[A-D]/,/[A-D]/,/[a-d1-4]/,/[a-d]/,/[5-8]/].forEach((r,i)=> {
			const ci = CornerToIdx.get(c) ?? -1
			ci>=0 && r.test(c) && Wall.#drawCorner(ctx,{type:i,ci,pos:{x,y}})
		})
		switch(c.replace('#','V').toUpperCase()) {
		case 'V':ctx.strokeLine(x+HT+lo, y, x+HT+lo, y+T);break
		case 'H':ctx.strokeLine(x, y+HT+lo, x+T, y+HT+lo);break
		}
		if (c == '#' || t.x == 0 && +c) {
			return ctx.strokeLine(x+OO, y, x+OO, y+T).void()
		}
		if (/[_=]/.test(c) || Maze.isTopOrBottom(t.y) && +c) {
			const oY = /[=56]/.test(c) ? OO : T-OO
			ctx.strokeLine(x, y+oY, x+T, y+oY)
			isNaN(+c) && ctx.strokeLine(x, y+HT+lo, x+T, y+HT+lo)
		}
	}
}
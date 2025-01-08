import {Color} from './_constants.js'
import {Ctx}   from './_canvas.js'

const linePaths0_8 = {
	0: [1,0,2,0,3,1,3,5,2,6,1,6,0,5,0,1],
	1: [0,1,1,0,1,6,0,6,2,6],
	2: [0,2,0,1,1,0,3,0,4,1,4,2,0,6,4,6],
	3: [0,0,4,0,2,2,4,4,4,5,3,6,1,6,0,5],
	4: [3,6,3,0,0,3,0,4,4,4],
	5: [4,0,0,0,0,2,3,2,4,3,4,5,3,6,1,6,0,5],
	6: [3,0,1,0,0,1,0,5,1,6,2,6,3,5,3,3,0,3],
	7: [0,1,0,0,4,0,4,1,2,4,2,6,],
	8: [1,0,3,0,4,1,4,2,3,3,1,3,0,4,0,5,1,6,3,6,4,5,4,4,3,3,1,3,0,2,0,1],
}
const coords100_5000 = {
	 100: [[1,-5,-3],[0,-1,-3],[0,4,-3]],
	 200: [[2,-7,-3],[0,-1,-3],[0,4,-3]],
	 300: [[3,-7,-3],[0,-1,-3],[0,4,-3]],
	 400: [[4,-7,-3],[0,-1,-3],[0,4,-3]],
	 500: [[5,-7,-3],[0,-1,-3],[0,4,-3]],
	 700: [[7,-7,-3],[0,-1,-3],[0,4,-3]],
	 800: [[8,-7,-3],[0,-1,-3],[0,4,-3]],
	1000: [[1,-8,-3],[0,-4,-3],[0,1,-3],[0,6,-3]],
	1600: [[-7,-3],[6,-5,-3],[0,0,-3],[0,5,-3]],
	2000: [[2,-10,-3],[0,-4,-3],[0,1,-3],[0,6,-3]],
	3000: [[3,-10,-3],[0,-4,-3],[0,1,-3],[0,6,-3]],
	5000: [[5,-10,-3],[0,-4,-3],[0,1,-3],[0,6,-3]],
}

class Sprite {
	constructor(x, y, pts) {
		const ofstX = +String(pts)[0] == 1 ? -.4 : 0
		const color = [200,400,800,1600].includes(pts)
			? Color.GhostPts
			: Color.FruitPts
		Ctx.save()
		Ctx.translate(x+ofstX, y)
		Ctx.lineWidth   = 1.2
		Ctx.lineCap     ='round'
		Ctx.lineJoin    ='round'
		Ctx.strokeStyle = color
		coords100_5000[pts]?.forEach((c,i)=> {
			pts == 1600 && !i
				? this.#stroke1nw(...c)
				: this.#stroke(...c)
		})
		Ctx.restore()
	}
	#stroke(n, x, y) {
		Ctx.save()
		Ctx.translate(x,y)
		this.#strokeLine(linePaths0_8[n], n==0 || n==8)
		Ctx.restore()
	}
	#stroke1nw(x, y) {
		this.#strokeLine([x,y,x,y+6])
	}
	#strokeLine(v, isOutline=false) {
		Ctx.beginPath()
		Ctx.moveTo(v[0], v[1])
		for (let i=2; i<v.length; i+=2)
			Ctx.lineTo(v[i], v[i+1])
		isOutline && Ctx.closePath()
		Ctx.stroke()
	}
}
export default (...args)=> new Sprite(...args)
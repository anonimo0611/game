const
/** @typedef {keyof PathFrom0To8} ZeroToEight */
PathFrom0To8 = /**@type {const}*/({
	0: [1,0,2,0,3,1,3,5,2,6,1,6,0,5,0,1],
	1: [0,1,1,0,1,6,0,6,2,6],
	2: [0,2,0,1,1,0,3,0,4,1,4,2,0,6,4,6],
	3: [0,0,4,0,2,2,4,4,4,5,3,6,1,6,0,5],
	4: [3,6,3,0,0,3,0,4,4,4],
	5: [4,0,0,0,0,2,3,2,4,3,4,5,3,6,1,6,0,5],
	6: [3,0,1,0,0,1,0,5,1,6,2,6,3,5,3,3,0,3],
	7: [0,1,0,0,4,0,4,1,2,4,2,6],
	8: [1,0,3,0,4,1,4,2,3,3,1,3,0,4,0,5,1,6,3,6,4,5,4,4,3,3,1,3,0,2,0,1],
}),
/** @typedef {keyof RelPosListFrom} PtsType */
RelPosListFrom = /**@type {const}*/({
	 100: [[1,-6.1,-3],[0,-2.1,-3],[0,2.7,-3]],
	 200: [[2,-7.0,-3],[0,-1.0,-3],[0,4.0,-3]],
	 300: [[3,-7.2,-3],[0,-1.2,-3],[0,3.8,-3]],
	 400: [[4,-7.1,-3],[0,-1.2,-3],[0,3.8,-3]],
	 500: [[5,-7.0,-3],[0,-1.0,-3],[0,4.0,-3]],
	 700: [[7,-7.0,-3],[0,-1.0,-3],[0,4.0,-3]],
	 800: [[8,-7.0,-3],[0,-1.0,-3],[0,4.0,-3]],
	1000: [[1,-8.0,-3],[0,-4.0,-3],[0,1.0,-3],[0,6.0,-3]],
	1600: [[1,-7.4,-3],[6,-5.3,-3],[0,-.3,-3],[0,4.7,-3]],
	2000: [[2,-10, -3],[0,-4.0,-3],[0,1.0,-3],[0,6.0,-3]],
	3000: [[3,-10, -3],[0,-4.0,-3],[0,1.0,-3],[0,6.0,-3]],
	5000: [[5,-10, -3],[0,-4.0,-3],[0,1.0,-3],[0,6.0,-3]],
}),
/** @type {ReadonlySet<number>} */
GhsPtsSet = new Set([200,400,800,1600])

export default new class {
	/** @type {(x:number, y:number, pts:number, size?:number)=> void} */
	draw(x, y, pts, size=TileSize*2) {
		Ctx.save()
		Ctx.translate(x, y)
		Ctx.scale(size/16, size/16)
		Ctx.lineWidth   = 1.2
		Ctx.lineCap     ='round'
		Ctx.lineJoin    ='round'
		Ctx.strokeStyle = GhsPtsSet.has(pts)
			? Color.GhostPts
			: Color.FruitPts
		RelPosListFrom[/**@type {PtsType}*/(pts)]
		?.forEach(([n,x,y],i)=> {
			pts == 1600 && i == 0
				? this.#strokeLines([x,y,x,y+6]) // narrow 1
				: this.#strokeNumber(n,x,y)
		})
		Ctx.restore()
	}

	/** @type {(n:ZeroToEight, x:number, y:number)=> void} */
	#strokeNumber(n, x, y) {
		Ctx.save()
		Ctx.translate(x,y)
		this.#strokeLines(PathFrom0To8[n], n==0 || n==8)
		Ctx.restore()
	}

	/** @type {(v:readonly number[], isClose?:boolean)=> void} */
	#strokeLines(v, isClose=false) {
		Ctx.beginPath()
		Ctx.moveTo(v[0], v[1])
		for (let i=2; i<v.length; i+=2)
			Ctx.lineTo(v[i], v[i+1])
		isClose && Ctx.closePath()
		Ctx.stroke()
	}
}
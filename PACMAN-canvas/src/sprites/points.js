const
FruitCvs = canvas2D(null),
GhostCvs = canvas2D(null),
PathFrom0To8 = /**@type const*/({
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
PosListFrom100to5000 = /**@type const*/({
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
})
export const GhostVals = /**@type const*/([200,400,800,1600])
export const FruitVals = /**@type const*/([100,300,500,700,1e3,2e3,3e3,5e3])

/** @type {ReadonlySet<number>} */
const GtsPtsSet = new Set(GhostVals)

/**
 * @typedef {keyof PosListFrom100to5000} PtsType
 * @param {PtsType} pts
 */
export function cache(pts, size=TileSize*2) {
	const isGhs = GtsPtsSet.has(pts)
	const ctx   = (isGhs? GhostCvs:FruitCvs).ctx
	const [w,h] = ctx.resize(size*1.5, size).size
	ctx.clear()
	ctx.save()
	ctx.translate(w/2, h/2)
	ctx.scale(size/16, size/16)
	ctx.lineWidth   = 1.2
	ctx.lineCap     ='round'
	ctx.lineJoin    ='round'
	ctx.strokeStyle = isGhs? Color.GhostPts:Color.FruitPts
	PosListFrom100to5000[pts]
	?.forEach(([n,x,y],i)=> {
		(pts == 1600 && i == 0) // narrow 1
			? stroke([x,y,x,y+6])
			: function() {
				ctx.save()
				ctx.translate(x,y)
				stroke(PathFrom0To8[n], n==0 || n==8)
				ctx.restore()
			}()
	})
	/** @param {readonly number[]} path */
	function stroke(path, isClose=false) {
		ctx.beginPath()
		ctx.moveTo(path[0], path[1])
		for (let i=2; i<path.length; i+=2)
			ctx.lineTo(path[i], path[i+1])
		isClose && ctx.closePath()
		ctx.stroke()
	}
	ctx.restore()
	return /**@type const*/({ctx,w,h})
}
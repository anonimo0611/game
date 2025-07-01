const FruitCvs = canvas2D(null)
const GhostCvs = canvas2D(null)

export const Vals = /**@type {const}*/({
	All:  [100,200,300,400,500,700,800,1e3,1600,2e3,3e3,5e3],
	Ghost:[200,400,800,1600],
	Fruit:[100,300,500,700,1e3,2e3,3e3,5e3]
})
const Data = /**@type {const}*/({
	PathFrom0To8: {
		0: [1,0,2,0,3,1,3,5,2,6,1,6,0,5,0,1],
		1: [0,1,1,0,1,6,0,6,2,6],
		2: [0,2,0,1,1,0,3,0,4,1,4,2,0,6,4,6],
		3: [0,0,4,0,2,2,4,4,4,5,3,6,1,6,0,5],
		4: [3,6,3,0,0,3,0,4,4,4],
		5: [4,0,0,0,0,2,3,2,4,3,4,5,3,6,1,6,0,5],
		6: [3,0,1,0,0,1,0,5,1,6,2,6,3,5,3,3,0,3],
		7: [0,1,0,0,4,0,4,1,2,4,2,6],
		8: [1,0,3,0,4,1,4,2,3,3,1,3,0,4,0,5,1,6,3,6,4,5,4,4,3,3,1,3,0,2,0,1],
	},
	PosListFrom100To5000: { // [digit, x, y][]
		 100: [[1,  -6.1, -3], [0, -2.3, -3], [0, 2.7, -3]],
		 200: [[2,  -7.0, -3], [0, -1.0, -3], [0, 4.0, -3]],
		 300: [[3,  -7.2, -3], [0, -1.2, -3], [0, 3.8, -3]],
		 400: [[4,  -7.1, -3], [0, -1.2, -3], [0, 3.8, -3]],
		 500: [[5,  -7.0, -3], [0, -1.0, -3], [0, 4.0, -3]],
		 700: [[7,  -7.0, -3], [0, -1.0, -3], [0, 4.0, -3]],
		 800: [[8,  -7.0, -3], [0, -1.0, -3], [0, 4.0, -3]],
		1000: [[1,  -8.0, -3], [0, -4.0, -3], [0, 1.0, -3], [0, 6.0, -3]],
		1600: [[1,  -7.4, -3], [6, -5.3, -3], [0, -.3, -3], [0, 4.7, -3]],
		2000: [[2, -10.0, -3], [0, -4.0, -3], [0, 1.0, -3], [0, 6.0, -3]],
		3000: [[3, -10.0, -3], [0, -4.0, -3], [0, 1.0, -3], [0, 6.0, -3]],
		5000: [[5, -10.0, -3], [0, -4.0, -3], [0, 1.0, -3], [0, 6.0, -3]],
	}
})
/** @type {ReadonlySet<number>} */
const GtsPtsSet = new Set(Vals.Ghost)

/**
 * @typedef {typeof Vals.All[number]} PtsType
 * @param {PtsType} pts
 */
export function cache(pts, size=TileSize*2) {
	const idx  = +GtsPtsSet.has(pts)
	const ctx  = [FruitCvs,GhostCvs][idx].ctx
	const[w,h] = ctx.resize(size*1.5,size).size
	ctx.clear()
	ctx.save()
	ctx.translate(w/2, h/2)
	ctx.scale(size/16, size/16)
	ctx.lineWidth   = 1.2
	ctx.lineJoin    = ctx.lineCap = 'round'
	ctx.strokeStyle = [Color.FruitPts,Color.GhostPts][idx]
	Data.PosListFrom100To5000[pts]
	?.forEach(([digit,x,y],i)=> {
		(pts == 1600 && i == 0)
		? ctx.newLinePath([x,y],[x,y+6]) //narrow 1
		: function() {
			ctx.save()
			ctx.translate(x,y)
			ctx.newLinePath(.../**@type {xyList[]}*/
				(chunk(Data.PathFrom0To8[digit],2)))
			;(digit == 0 || digit == 8) && ctx.closePath()
			ctx.restore()
		}()
		ctx.stroke()
	})
	ctx.restore()
	return/**@type {const}*/({ctx,w,h})
}
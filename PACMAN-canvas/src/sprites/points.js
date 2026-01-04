export {AllPts,GhostPts,FruitPts,cache}

const FruitCvs = canvas2D(null)
const GhostCvs = canvas2D(null)

const AllPts   = /**@type {const}*/([100,200,300,400,500,700,800,1e3,1600,2e3,3e3,5e3])
const GhostPts = /**@type {const}*/([200,400,800,1600])
const FruitPts = /**@type {const}*/([100,300,500,700,1e3,2e3,3e3,5e3])

const Data = /**@type {const}*/({
	PathFrom0To8: [
		[1,0,2,0,3,1,3,5,2,6,1,6,0,5,0,1],
		[0,1,1,0,1,6,0,6,2,6],
		[0,2,0,1,1,0,3,0,4,1,4,2,0,6,4,6],
		[0,0,4,0,2,2,4,4,4,5,3,6,1,6,0,5],
		[3,6,3,0,0,3,0,4,4,4],
		[4,0,0,0,0,2,3,2,4,3,4,5,3,6,1,6,0,5],
		[3,0,1,0,0,1,0,5,1,6,2,6,3,5,3,3,0,3],
		[0,1,0,0,4,0,4,1,2,4,2,6],
		[1,0,3,0,4,1,4,2,3,3,1,3,0,4,0,5,1,6,3,6,4,5,4,4,3,3,1,3,0,2,0,1],
	],
	DigitOffsetY: -3,
	DigitOffsetXFrom: {
		 100: [ -6.1, -2.3, 2.7],
		 200: [ -7.0, -1.0, 4.0],
		 300: [ -7.2, -1.2, 3.8],
		 400: [ -7.1, -1.2, 3.8],
		 500: [ -7.0, -1.0, 4.0],
		 700: [ -7.0, -1.0, 4.0],
		 800: [ -7.0, -1.0, 4.0],
		1000: [ -8.0, -4.0, 1.0, 6.0],
		1600: [ -7.4, -5.3, -.3, 4.7],
		2000: [-10.0, -4.0, 1.0, 6.0],
		3000: [-10.0, -4.0, 1.0, 6.0],
		5000: [-10.0, -4.0, 1.0, 6.0],
	}
})
/** @type {ReadonlySet<number>} */
const GtsPtsSet = new Set(GhostPts)

/**
 @typedef {typeof AllPts[number]} PtsType
 @param {PtsType} pts
*/
function cache(pts, size=TileSize*2) {
	const idx  = +GtsPtsSet.has(pts)
	const ctx  = [FruitCvs, GhostCvs][idx].ctx
	const cst  = [Colors.FruitPts, Colors.GhostPts][idx]
	const{w,h} = ctx.resize(size*1.5, size).size
	ctx.clear()
	ctx.save()
	ctx.translate(w/2, h/2)
	ctx.scale(size/16, size/16)
	ctx.strokeStyle = cst
	ctx.lineWidth = 1.2
	ctx.lineJoin  = ctx.lineCap = 'round'
	Data.DigitOffsetXFrom[pts]?.forEach((x,i)=> {
		const y = Data.DigitOffsetY
		 pts == 1600 && i == 0
		?ctx.newLinePath([x,y],[x,y+6]) //narrow 1
		:function() {
			const d = +pts.toString()[i]
			ctx.save()
			ctx.translate(x,y)
			ctx.beginPath()
			ctx.setVertices(Data.PathFrom0To8[d])
			if ([0,8].includes(d)) ctx.closePath()
			ctx.restore()
		}()
		ctx.stroke()
	})
	ctx.restore()
	return /**@type {const}*/({ctx,w,h})
}
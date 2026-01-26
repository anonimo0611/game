export {AllPts,GhostPts,FruitPts,cache}

const FruitCvs = canvas2D(null)
const GhostCvs = canvas2D(null)
const AllPts   = /**@type {const}*/([100,200,300,400,500,700,800,1e3,1600,2e3,3e3,5e3])
const GhostPts = /**@type {const}*/([200,400,800,1600])
const FruitPts = /**@type {const}*/([100,300,500,700,1e3,2e3,3e3,5e3])

const NarrowOnePath = new Path2D('M0,0 L0,6')
const DigitPath0to8 = freeze([
	'M1,0 L2,0 L3,1 L3,5 L2,6 L1,6 L0,5 L0,1 Z',
	'M0,1 L1,0 L1,6 L0,6 L2,6',
	'M0,2 L0,1 L1,0 L3,0 L4,1 L4,2 L0,6 L4,6',
	'M0,0 L4,0 L2,2 L4,4 L4,5 L3,6 L1,6 L0,5',
	'M3,6 L3,0 L0,3 L0,4 L4,4',
	'M4,0 L0,0 L0,2 L3,2 L4,3 L4,5 L3,6 L1,6 L0,5',
	'M3,0 L1,0 L0,1 L0,5 L1,6 L2,6 L3,5 L3,3 L0,3',
	'M0,1 L0,0 L4,0 L4,1 L2,4 L2,6',
	`M1,0 L3,0 L4,1 L4,2 L3,3 L1,3 L0,4 L0,5
	 L1,6 L3,6 L4,5 L4,4 L3,3 L1,3 L0,2 L0,1 Z`].map(d=> new Path2D(d)))

const KerningMap = freeze({
	 100: [ -6.1, -2.3, 2.7],
	 200: [ -7.0, -1.0, 4.0],
	 300: [ -7.2, -1.2, 3.8],
	 400: [ -7.1, -1.2, 3.8],
	 500: [ -7.0, -1.0, 4.0],
	 700: [ -7.0, -1.0, 4.0],
	 800: [ -7.0, -1.0, 4.0],
	1000: [ -8.0, -4.0, 1.0, 6.0],
	1600: [ -7.5, -5.3,-.25, 4.7],
	2000: [-10.0, -4.0, 1.0, 6.0],
	3000: [-10.0, -4.0, 1.0, 6.0],
	5000: [-10.0, -4.0, 1.0, 6.0]})

/** @type {ReadonlySet<number>} */
const GtsPtsSet = new Set(GhostPts)

/**
 @typedef {typeof AllPts[number]} PtsType
 @param {PtsType} pts
*/
function cache(pts, size=T*2) {
	const idx   = +GtsPtsSet.has(pts)
	const ctx   = [FruitCvs, GhostCvs][idx].ctx
	const color = [Colors.FruitPts, Colors.GhostPts][idx]
	const {w,h} = ctx.resize(size*1.5, size).size
	ctx.clear()
	ctx.save()
	ctx.translate(w/2, h/2)
	ctx.scale(size/16, size/16)
	ctx.strokeStyle = color
	ctx.lineWidth = 1.2
	ctx.lineJoin  = ctx.lineCap = 'round'
	KerningMap[pts].forEach((x,i)=> {
		const path = (pts == 1600 && i == 0)
			? NarrowOnePath
			: DigitPath0to8[+pts.toString()[i]]
		ctx.save()
		ctx.translate(x,-3)
		ctx.beginPath()
		ctx.stroke(path)
		ctx.restore()
	})
	ctx.restore()
	return /**@type {const}*/({ctx,w,h})
}

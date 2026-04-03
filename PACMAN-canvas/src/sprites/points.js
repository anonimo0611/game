const
ctxFruit_Ghost = freeze([
	canvas2D(null).ctx,
	canvas2D(null).ctx
]),
NarrowOnePath = path2D('M0,0 L0,6'),
DigitPath0to8 = /**@type {NumericDict<Path2D>}*/({
	0: path2D('M1,0 L2,0 L3,1 L3,5 L2,6 L1,6 L0,5 L0,1 Z'),
	1: path2D('M0,1 L1,0 L1,6 L0,6 L2,6'),
	2: path2D('M0,2 L0,1 L1,0 L3,0 L4,1 L4,2 L0,6 L4,6'),
	3: path2D('M0,0 L4,0 L2,2 L4,4 L4,5 L3,6 L1,6 L0,5'),
	4: path2D('M3,6 L3,0 L0,3 L0,4 L4,4'),
	5: path2D('M4,0 L0,0 L0,2 L3,2 L4,3 L4,5 L3,6 L1,6 L0,5'),
	6: path2D('M3,0 L1,0 L0,1 L0,5 L1,6 L2,6 L3,5 L3,3 L0,3'),
	7: path2D('M0,1 L0,0 L4,0 L4,1 L2,4 L2,6'),
	8: path2D(`M1,0 L3,0 L4,1 L4,2 L3,3 L1,3 L0,4 L0,5 L1,6 L3,6 L4,5 L4,4 L3,3 L1,3 L0,2 L0,1 Z`)
}),
KerningMap = /**@type {const}*/({
	 100: [ -5.9, -2.0, 3.0],
	 200: [ -7.0, -1.0, 4.0],
	 300: [ -7.0, -1.0, 4.0],
	 400: [ -7.0, -1.0, 4.0],
	 500: [ -7.0, -1.0, 4.0],
	 700: [ -7.0, -1.0, 4.0],
	 800: [ -7.0, -1.0, 4.0],
	1000: [ -8.0, -4.0, 1.0, 6.0],
	1600: [ -7.4, -5.3, -.3, 4.7],
	2000: [-10.0, -4.0, 1.0, 6.0],
	3000: [-10.0, -4.0, 1.0, 6.0],
	5000: [-10.0, -4.0, 1.0, 6.0],
})

/**
 @param {0|1} type 0=Fruits, 1=Ghosts
 @param {PtsValue} pts
*/
export function cache(type, pts, size=T*2) {
	const ctx = ctxFruit_Ghost[type]
	const{w,h}= ctx.resize(size*1.5, size).size
	ctx.save()
	ctx.translate(w/2, h/2)
	ctx.scale(size/16)
	ctx.strokeStyle = Palette.Points[type]
	ctx.lineWidth = 1.1
	ctx.lineJoin  = ctx.lineCap = 'round'
	KerningMap[pts].forEach((x,i)=> {
		const path = (pts == 1600 && i == 0)
			? NarrowOnePath
			: DigitPath0to8[+pts.toString()[i]]
		ctx.save()
		ctx.translate(x,-3)
		ctx.stroke(path)
		ctx.restore()
	})
	ctx.restore()
	return /**@type {const}*/({ctx,w,h})
}
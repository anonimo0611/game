export default class GhostSubSprite {
	/** @readonly */ctx
	/** @param {EnhancedCtx2D} ctx */
	constructor(ctx) {this.ctx=ctx}
	drawRippedBody() {
		const {ctx}= this
		ctx.clearRect(38,-1, 6,25)
		ctx.clearRect(30,23,15,18)
		ctx.newLinePath([38,-8],[49,-5],[36, 4]).fill()
		ctx.newLinePath([40, 1],[40,23],[35,23])
		ctx.quadraticCurveTo(28, 32, 35, 32)
		ctx.addLinePath([43,32],[43,42],[9,42],[9,38],[18,32],[26,25],[21,20],[19,19])
		ctx.fillStyle = Color.GhostSkin
		ctx.fill()
	}
	drawMendedSeam(animIdx=0) {
		const {ctx}= this, path = /**@type {xyTuple[]}*/
			([[39,8],[33,14],[24,8],[14,15],[26,20],[14,27],[25,33],[14,38]])
		animIdx && path.pop()
		ctx.lineWidth   = 3.5
		ctx.strokeStyle = 'white'
		ctx.newLinePath(...path).stroke()
		path.forEach(xy=> ctx.fillCircle(...xy, ctx.lineWidth, '#FFF'))
	}
	drawDazedEyes() {
		const {ctx}= this
		for (const vx of [-1,+1]) { // Eyeball
			ctx.beginPath()
			ctx.ellipse(19*vx, -14, 13,16, 0, PI/2, PI*2.05)
			ctx.fill()
		}
		ctx.lineWidth   = 8
		ctx.lineCap     = 'square'
		ctx.strokeStyle = 'black'
		for (const i of [0,1]) { // Eyes
			ctx.newLinePath(
				[[-16, 21][i],  0],
				[[-16, 21][i], -7],
				[[ -8, 29][i], -7],
			).stroke()
		}
	}
	drawHadake0() {
		const {ctx}= this
		// Body
		ctx.save()
		ctx.beginPath()
		ctx.moveTo(10, 31)
		ctx.quadraticCurveTo(18, 2, 50, -13)
		ctx.addLinePath([83,-12],[76,2])
		ctx.quadraticCurveTo(71, 14, 62, 22)
		ctx.addLinePath([78,23],[78,40],[59,40],[59,34])
		ctx.fillStyle = Color.GhostSkin
		ctx.fill()
		ctx.restore()

		// Clothes
		ctx.beginPath()
		ctx.setLinePath([-45,40],[-33,25])
		ctx.quadraticCurveTo(-21, 13, -13, 26)
		ctx.quadraticCurveTo(-6, 34, 4, 24)
		ctx.quadraticCurveTo(14, 18, 21.5, 16)
		ctx.quadraticCurveTo(32, 11, 35, 20)
		ctx.quadraticCurveTo(42, 30, 47, 33)
		ctx.addLinePath([39,33],[35,40],[-41,40])
		ctx.fill()
		this.#hadakeEyes([55,76],[61,83])
	}
	drawHadake1() {
		const {ctx}= this
		// Body
		ctx.save()
		ctx.beginPath()
		ctx.moveTo(7, 35)
		ctx.quadraticCurveTo(25, 15, 44, -10)
		ctx.addLinePath([73,-10],[73,7])
		ctx.quadraticCurveTo(72, 17, 67, 22)
		ctx.addLinePath([85,22],[85,40],[66,40],[66,34],[34,34])
		ctx.fillStyle = Color.GhostSkin
		ctx.fill()
		ctx.restore()

		// Clothes
		ctx.newLinePath([-45,40],[-36,30])
		ctx.quadraticCurveTo(-26, 19, -21, 29)
		ctx.addLinePath([18,29],[18,23],[44,22],[50,30],[46,33],[40,40])
		ctx.fill()
		this.#hadakeEyes([50,71],[56,78])
	}
	/**
	 @param {[L:number, R:number]} ballsLR
	 @param {[L:number, R:number]} eyesLR
	*/
	#hadakeEyes(ballsLR, eyesLR) {
		const {ctx}= this
		for (const i of [1,0]) {
			// Eyeballs
			ctx.beginPath()
			ctx.ellipse(ballsLR[i], -15, 11, 16, 0,0, PI*2)
			ctx.fillStyle = 'white'
			ctx.fill()
			// Eyes
			ctx.beginPath()
			ctx.ellipse(eyesLR[i], -15, 5, 9, 0,0, PI*2)
			ctx.fillStyle = Color.GhostEye
			ctx.fill()
		}
	}
}
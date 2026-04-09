export default class GhostSubSprite {
	/** @readonly */ctx
	/** @param {EnhancedCtx2D} ctx */
	constructor(ctx) {this.ctx=ctx}
	drawHalfNakedBody() {
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
	drawShatteredEyes() {
		const {ctx}= this
		for (const v of [-1,+1]) { // Eyeball
			ctx.beginPath()
			ctx.ellipse(19*v, -14, 13,16, 0, PI/2, PI*2.05)
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
	drawHadake(animIdx=0) {
		const {ctx}= this
		ctx.save()
		ctx.translate(T/2)
		animIdx == 0
			? this.#drawHadake0()
			: this.#drawHadake1()
		ctx.restore()
	}
	#drawHadake0() {
		const {ctx}= this
		// Body
		ctx.save()
		ctx.beginPath()
		ctx.moveTo(-6, 19)
		ctx.quadraticCurveTo(2, -10, 34, -25)
		ctx.addLinePath([67,-24],[60,-10])
		ctx.quadraticCurveTo(55, 2, 46, 10)
		ctx.addLinePath([62,11],[62,28],[43,28],[43,22])
		ctx.fillStyle = Color.GhostSkin
		ctx.fill()
		ctx.restore()

		// Clothes
		ctx.beginPath()
		ctx.setLinePath([-61,28],[-49,13])
		ctx.quadraticCurveTo(-37,  1, -29, 14)
		ctx.quadraticCurveTo(-22, 22, -12, 12)
		ctx.quadraticCurveTo( -2,  6, 5.5,  4)
		ctx.quadraticCurveTo( 16, -1,  19,  8)
		ctx.quadraticCurveTo( 26, 18,  31, 21)
		ctx.addLinePath([23,21],[19,28],[-57,28])
		ctx.fill()
		this.#hadakeEyes([39,60],[45,67])
	}
	#drawHadake1() {
		const {ctx}= this
		// Body
		ctx.save()
		ctx.beginPath()
		ctx.moveTo(-9, 23)
		ctx.quadraticCurveTo(9, 3, 28, -22)
		ctx.addLinePath([57,-22],[57,-5])
		ctx.quadraticCurveTo(56, 5, 51, 10)
		ctx.addLinePath([69,10],[69,28],[50,28],[50,22],[18,22])
		ctx.fillStyle = Color.GhostSkin
		ctx.fill()
		ctx.restore()

		// Clothes
		ctx.newLinePath([-61, 28],[-52, 18])
		ctx.quadraticCurveTo(-42, 7, -37, 17)
		ctx.addLinePath([2,17],[2,11],[28,10],[34,18],[30,21],[24,28])
		ctx.fill()
		this.#hadakeEyes([34,55],[40,62])
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
			ctx.ellipse(ballsLR[i], -27, 11, 16, 0,0, PI*2)
			ctx.fillStyle = 'white'
			ctx.fill()
			// Eyes
			ctx.beginPath()
			ctx.ellipse(eyesLR[i], -27, 5, 9, 0,0, PI*2)
			ctx.fillStyle = Color.GhostEyes
			ctx.fill()
		}
	}
}
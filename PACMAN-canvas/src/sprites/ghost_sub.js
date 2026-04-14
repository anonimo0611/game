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
	drawDazedEyes() {
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
		ctx.moveTo(-6, 15)
		ctx.quadraticCurveTo(2, -14, 34, -29)
		ctx.addLinePath([67,-28],[60,-14])
		ctx.quadraticCurveTo(55, -2, 46, 6)
		ctx.addLinePath([62,7],[62,24],[43,24],[43,18])
		ctx.fillStyle = Color.GhostSkin
		ctx.fill()
		ctx.restore()

		// Clothes
		ctx.beginPath()
		ctx.setLinePath([-61,24],[-49,9])
		ctx.quadraticCurveTo(-37, -3, -29, 10)
		ctx.quadraticCurveTo(-22, 18, -12, 8)
		ctx.quadraticCurveTo(-2, 2, 5.5, 0)
		ctx.quadraticCurveTo(16, -5, 19, 4)
		ctx.quadraticCurveTo(26, 14, 31, 17)
		ctx.addLinePath([23,17],[19,24],[-57,24])
		ctx.fill()
		this.#hadakeEyes([39,60],[45,67])
	}
	#drawHadake1() {
		const {ctx}= this
		// Body
		ctx.save()
		ctx.beginPath()
		ctx.moveTo(-9, 19)
		ctx.quadraticCurveTo(9, -1, 28, -26)
		ctx.addLinePath([57,-26],[57,-9])
		ctx.quadraticCurveTo(56, 1, 51, 6)
		ctx.addLinePath([69,6],[69,24],[50,24],[50,18],[18,18])
		ctx.fillStyle = Color.GhostSkin
		ctx.fill()
		ctx.restore()

		// Clothes
		ctx.newLinePath([-61,24],[-52,14])
		ctx.quadraticCurveTo(-42, 3, -37, 13)
		ctx.addLinePath([2,13],[2,7],[28,6],[34,14],[30,17],[24,24])
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
			ctx.ellipse(ballsLR[i], -31, 11, 16, 0,0, PI*2)
			ctx.fillStyle = 'white'
			ctx.fill()
			// Eyes
			ctx.beginPath()
			ctx.ellipse(eyesLR[i], -31, 5, 9, 0,0, PI*2)
			ctx.fillStyle = Color.GhostEye
			ctx.fill()
		}
	}
}
export default class {
	/** @param {ExtendedContext2D} ctx */
	constructor(ctx) {
		this.ctx = ctx
		freeze(this)
	}
	rippedBody() {
		const {ctx}= this
		ctx.clearRect(38,-1, 6,25)
		ctx.clearRect(30,23,15,15)
		ctx.newLinePath([38,-8],[49,-5],[36, 4]).fill()
		ctx.newLinePath([40, 1],[40,23],[35,23])
		ctx.quadraticCurveTo(28, 32, 35, 32)
		ctx.addLinePath([43,32],[43,42],[9,42],[9,38],[18,32],[26,25],[21,20],[19,19])
		ctx.fillStyle = Color.GhostSkin
		ctx.fill()
	}
	mendedStitch(aIdx=0) {
		const {ctx}= this, path = /**@type {xyList[]}*/
			([[39,8],[33,14],[24,8],[14,15],[26,20],[14,27],[25,33],[14,38]])
		aIdx && path.pop()
		ctx.lineWidth   = 3.5
		ctx.strokeStyle = '#FFF'
		ctx.newLinePath(...path).stroke()
		path.forEach(xy=> ctx.fillCircle(...xy, ctx.lineWidth, '#FFF'))
	}
	bracketEyes() {
		const {ctx}= this
		ctx.save()
		for (const v of [-1,+1]) {
			ctx.beginPath() // Eyeball
			ctx.ellipse(19*v, -14, 13,16, 0, PI/2.2, PI*2.2)
			ctx.fillStyle = '#FFF'
			ctx.fill()
		}
		ctx.lineWidth   = 8
		ctx.lineCap     = 'square'
		ctx.strokeStyle = '#000'
		for (const i of [0,1]) {
			ctx.beginPath() // Eyes
			ctx.moveTo([-15, 22][i],  0)
			ctx.lineTo([-15, 22][i], -7)
			ctx.lineTo([ -7, 30][i], -7)
			ctx.stroke()
		}
		ctx.restore()
	}
	hadake(aIdx=0) {
		const {ctx}= this
		ctx.save()
		ctx.translate(T/2+T/10, T/2)
		aIdx == 0
			? this.#hadake0()
			: this.#hadake1()
		ctx.restore()
	}
	#hadake0() {
		const {ctx}= this
		// Body
		ctx.save()
		ctx.beginPath()
		ctx.moveTo(-12, 13)
		ctx.quadraticCurveTo(-4, -16, 28, -31)
		ctx.addLinePath([61, -30],[54, -16])
		ctx.quadraticCurveTo(49, -4, 40, 4)
		ctx.addLinePath([56,5],[56,22],[37,22],[37,16])
		ctx.fillStyle = Color.GhostSkin
		ctx.fill()
		ctx.restore()

		// Clothes
		ctx.beginPath()
		ctx.setLinePath([-67,22],[-55,7])
		ctx.quadraticCurveTo(-43, -5, -35,  8)
		ctx.quadraticCurveTo(-28, 16, -18,  6)
		ctx.quadraticCurveTo( -8,  0, -.5, -2)
		ctx.quadraticCurveTo( 10, -7,  13,  2)
		ctx.quadraticCurveTo( 20, 12,  25, 15)
		ctx.addLinePath([17,15],[13,22],[-63,22])
		ctx.fill()
		this.#hadakeEyes([33,54],[39,61])
	}
	#hadake1() {
		const {ctx}= this
		// Body
		ctx.save()
		ctx.beginPath()
		ctx.moveTo(-15,17)
		ctx.quadraticCurveTo(3, -3, 22, -28)
		ctx.addLinePath([51,-28],[51,-11])
		ctx.quadraticCurveTo(50, -1, 45, 4)
		ctx.addLinePath([63,4],[63,22],[44,22],[44,16],[12,16])
		ctx.fillStyle = Color.GhostSkin
		ctx.fill()
		ctx.restore()

		// Clothes
		ctx.newLinePath([-67, 22],[-58, 12])
		ctx.quadraticCurveTo(-48, 1, -43, 11)
		ctx.addLinePath([-4,11],[-4,5],[22,4],[28,12],[24,15],[18,22])
		ctx.fill()
		this.#hadakeEyes([28,49],[34,56])
	}
	#hadakeEyes(
	 /**@type {[L:number, R:number]}*/ballsLR,
	 /**@type {[L:number, R:number]}*/eyesLR
	) {
		const {ctx}= this
		for (const i of [1,0]) {
			// Eyeballs
			ctx.beginPath()
			ctx.ellipse(ballsLR[i], -33, 11, 16, 0,0, PI*2)
			ctx.fillStyle = '#FFF'
			ctx.fill()
			// Eyes
			ctx.beginPath()
			ctx.ellipse(eyesLR[i], -33, 5, 9, 0,0, PI*2)
			ctx.fillStyle = Color.GhostEyes
			ctx.fill()
		}
	}
	static get stakeClothes() {return freeze(new StakeClothes)}
}
class StakeClothes {
	CaughtX   = CW/2 + T/2
	AkaMinX   = this.CaughtX - T
	stakeSize = Vec2(T*.18, T*.70).freeze()
	stakePos  = freeze({
		x: CW/2 + T*2 - this.stakeSize.x/2,
		y: CH/2 + T*1 - this.stakeSize.y - T*.1
	})
	offcutPos = freeze({
		x: CW/2 + T*2 + this.stakeSize.x/2,
		y: CH/2 + T*1 - T*.1
	})
	drawStake({x, y}=this.stakePos) {
		Ctx.fillRect(x,y, ...this.stakeSize.vals, '#FFF')
	}
	drawOffcut({x, y}=this.offcutPos) {
		const h = this.stakeSize.y
		Ctx.save()
		Ctx.translate(x, y)
		Ctx.fillPolygon(Color.Akabei, [0,-4],[0,-h],[-T,0],[-4,0],[-4,-4])
		Ctx.restore()
	}
	/**
	 * @param {number} aIdx
	 * @param {number} rate
	 * @param {{x?:number, y?:number, size?:number}} cfg
	 */
	expandClothes(aIdx, rate, {x=0, y=0, size=T*2}={}) {
		const v1 = lerp(-2,  5, rate)
		const v2 = lerp( 4, 22, rate)
		const v3 = lerp( 4, 50, rate)
		const ls = (aIdx? -25:-36) // Left side
		Ctx.save()
		Ctx.translate(x, y)
		Ctx.scale(size/(100/GhsScale), size/(100/GhsScale))
		Ctx.beginPath()
		Ctx.moveTo(-8, -10)
		Ctx.quadraticCurveTo(-8,-4, v1, 3)
		Ctx.quadraticCurveTo(v2, 9, v3, 9)
		Ctx.addLinePath([v3,43],[ls,43],[ls,20],[-8,20])
		Ctx.fillStyle = Color.Akabei
		Ctx.fill()
		Ctx.restore()
	}
}
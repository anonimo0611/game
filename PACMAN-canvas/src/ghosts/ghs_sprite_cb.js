import {Vec2} from '../../_lib/vec2.js'
import {Cvs,Ctx,Color,GhsScale,TileSize as T} from '../_constants.js'

export default class {
	/** @param {CanvasRenderingContext2D} ctx */
	constructor(ctx) {
		this.ctx = ctx
		freeze(this)
	}
	rippedBody() {
		const {ctx}= this
		cvsFillRect(ctx)(38,-1, 6,25, null)
		cvsFillRect(ctx)(30,23,15,15, null)
		cvsSetNewLinePath(ctx)([38,-8],[49,-5],[36, 4]);ctx.fill()
		cvsSetNewLinePath(ctx)([40, 1],[40,23],[35,23])
		ctx.quadraticCurveTo(28, 32, 35, 32)
		cvsSetLineTo(ctx)([43,32],[43,42],[9,42],[9,38],[18,32],[26,25],[21,20],[19,19])
		ctx.fillStyle = Color.GhostSkin
		ctx.fill()
	}
	mendedStitch(idx=0) {
		const {ctx}= this,
		coords = [[39,8],[33,14],[24,8],[14,15],[26,20],[14,27],[25,33],idx?[]:[14,38]]
		ctx.lineWidth = 3.5
		ctx.strokeStyle = '#FFF'
		cvsSetNewLinePath(ctx)(...coords)
		ctx.stroke()
		coords.forEach(c=> cvsFillCircle(ctx)(...c, ctx.lineWidth, '#FFF'))
	}
	bracketEyes() {
		const {ctx}= this
		ctx.save()
		for (const v of [-1,+1]) {
			ctx.beginPath() // Eyeball
			ctx.fillStyle = '#FFF'
			ctx.ellipse(19*v, -14, 13,16, 0, PI/2.2, PI*2.2)
			ctx.fill()
		}
		ctx.lineWidth   = 8
		ctx.lineCap     = 'square'
		ctx.strokeStyle = '#000'
		for (let i=0; i<=1; i++) {
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
		cvsSetLineTo(ctx)([61, -30],[54, -16])
		ctx.quadraticCurveTo(49, -4, 40, 4)
		cvsSetLineTo(ctx)([56,5],[56,22],[37,22],[37,16])
		ctx.fillStyle = Color.GhostSkin
		ctx.fill()
		ctx.restore()

		// Clothes
		ctx.beginPath()
		cvsSetLinePath(ctx)([-67,22],[-55,7])
		ctx.quadraticCurveTo(-43, -5, -35,  8)
		ctx.quadraticCurveTo(-28, 16, -18,  6)
		ctx.quadraticCurveTo( -8,  0, -.5, -2)
		ctx.quadraticCurveTo( 10, -7,  13,  2)
		ctx.quadraticCurveTo( 20, 12,  25, 15)
		cvsSetLineTo(ctx)([17,15],[13,22],[-63,22])
		ctx.fill()
		for (let i=1; i>=0; i--) {
			// Eyeballs
			ctx.beginPath()
			ctx.ellipse([33,54][i], -33, 11, 16, 0,0, PI*2)
			ctx.fillStyle = '#FFF'
			ctx.fill()
			// Eyes
			ctx.beginPath()
			ctx.ellipse([39,61][i], -33,  5, 9, 0,0, PI*2)
			ctx.fillStyle = Color.GhostEyes
			ctx.fill()
		}
	}
	#hadake1() {
		const {ctx}= this
		// Body
		ctx.save()
		ctx.beginPath()
		ctx.moveTo(-15,17)
		ctx.quadraticCurveTo(3, -3, 22, -28)
		cvsSetLineTo(ctx)([51,-28],[51,-11])
		ctx.quadraticCurveTo(50, -1, 45, 4)
		cvsSetLineTo(ctx)([63,4],[63,22],[44,22],[44,16],[12,16])
		ctx.fillStyle = Color.GhostSkin
		ctx.fill()
		ctx.restore()

		// Clothes
		ctx.beginPath()
		cvsSetLinePath(ctx)([-67, 22],[-58, 12])
		ctx.quadraticCurveTo(-48, 1, -43, 11)
		cvsSetLineTo(ctx)([-4,11],[-4,5],[22,4],[28,12],[24,15],[18,22])
		ctx.fill()
		for (let i=1; i>=0; i--) {
			// Eyeballs
			ctx.beginPath()
			ctx.ellipse([28,49][i], -33, 11, 16, 0,0, PI*2)
			ctx.fillStyle = '#FFF'
			ctx.fill()
			// Eyes
			ctx.beginPath()
			ctx.ellipse([34,56][i], -33, 5, 8.6, 0,0, PI*2)
			ctx.fillStyle = Color.GhostEyes
			ctx.fill()
		}
	}
	static get stakeClothes() {return new StakeClothes}
}
class StakeClothes {
	constructor() {
		this.CaughtX = Cvs.width/2 + T/2
		this.AkaMinX = this.CaughtX - T
		this.stake = freeze(new class {
			size = Vec2(T*.18, T*.7).freeze()
			x = Cvs.width /2 + T-this.size.x/2 + T
			y = Cvs.height/2 + T-this.size.y - T*.1
		})
		this.offcut = freeze({
			x: Cvs.width /2 + T*2 + this.stake.size.x/2,
			y: Cvs.height/2 + T - T*.1
		})
		freeze(this)
	}
	drawStake({x, y}=this.stake) {
		cvsFillRect(Ctx)(x,y, ...this.stake.size.vals, '#FFF')
	}
	drawOffcut({x, y}=this.offcut) {
		Ctx.save()
		Ctx.translate(x, y)
		cvsSetNewLinePath(Ctx, Color.Akabei)
			([0,-4],[0,-this.stake.size.y],[-T,0],[-4,0],[-4,-4])
		Ctx.restore()
	}
	expandClothes({x, y, size=T*2}={}, aIdx, rate) {
		const v1 = lerp(-2,  5, rate)
		const v2 = lerp( 4, 22, rate)
		const v3 = lerp( 4, 50, rate)
		const ls = (aIdx? -25:-36) // Left side
		Ctx.save()
		Ctx.translate(x, y)
		Ctx.scale(size/(100/GhsScale), size/(100/GhsScale))
		Ctx.beginPath()
		Ctx.moveTo(-8, -16)
		Ctx.quadraticCurveTo(-8,-4, v1, 3)
		Ctx.quadraticCurveTo(v2, 9, v3, 7)
		cvsSetLineTo(Ctx)([v3,43],[ls,43],[ls,20],[-8,20])
		Ctx.fillStyle = Color.Akabei
		Ctx.fill()
		Ctx.restore()
	}
}
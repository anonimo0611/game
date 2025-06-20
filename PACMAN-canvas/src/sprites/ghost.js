import CBSprite from './ghost_cb.js'
export default class {
	#fadeOut   = /**@type {?FadeOut}*/(null)
	#resurrect = /**@type {?FadeIn} */(null)

	/** @readonly */#CBSprite
	/** @readonly */#EyesDraw
	/** @param {ExtendedContext2D} ctx */
	constructor(ctx) {
		this.ctx = ctx
		this.#CBSprite = new CBSprite(ctx)
		this.#EyesDraw = /**@type {const}*/
		({
			[L]:this.#eyesLookingLR,
			[R]:this.#eyesLookingLR,
			[U]:this.#eyesLookingUp,
			[D]:this.#eyesLookingDown,
			LowerR:this.#CBSprite.bracketEyes
		})
		freeze(this)
	}

	get fadeOut()  {return this.#fadeOut}
	setFadeOut()   {this.#fadeOut ||= new FadeOut(400)}
	setResurrect() {this.#resurrect = new FadeIn (600)}
	draw({
		mainCtx=Ctx,x=0,y=0,
		aIdx       = 0,
		spriteIdx  = 0,
		size       = T*2,
		orient     = /**@type {Direction}*/(L),
		color      = Color.Akabei,
		isFright   = false,
		isBitten   = false,
		isEscaping = false,
		isAngry    = false,
		isRipped   = false,
		isMended   = false,
		isExposed  = false,
	}={}) {
		if (isBitten) return
		const {ctx}= this
		ctx.clear()
		ctx.save()
		function finalize() {
			ctx.restore()
			mainCtx.save()
			mainCtx.translate(x+size/4, y+size/4)
			mainCtx.drawImage(ctx.canvas, -size/2, -size/2)
			mainCtx.restore()
		}
		ctx.translate(size/2, size/2)
		ctx.scale(size/(100/GhsScale), size/(100/GhsScale))
		ctx.fillStyle = !isFright
			? color : Color.FrightBodyTable[spriteIdx]

		if (isExposed) {
			this.#CBSprite.hadake(aIdx)
			return finalize()
		}
		if (!isEscaping) {
			ctx.save()
			this.#resurrect?.setAlpha(ctx)
			this.#angryGlow({x,y, isAngry,size})
			this.#body({aIdx,isRipped,isMended})
			isFright && this.#frightFace({spriteIdx})
			ctx.restore()
		}
		if (!isFright) {
			this.#EyesDraw[orient].call(this,{orient,isRipped})
		}
		finalize()
	}
	update() {
		if (this.#resurrect?.update() === false)
			this.#resurrect = null
	}
	#body({aIdx=0, isRipped=false, isMended=false}) {
		const {ctx}= this
		ctx.beginPath()
		ctx.moveTo(+42, +26)
		ctx.lineTo(+42, +11)
		ctx.bezierCurveTo(+42,-60, -42,-60, -42,11)
		ctx.lineTo(-42, +26)
		aIdx == 0
			? this.#foot0()
			: this.#foot1()
		ctx.fill()
		isRipped && this.#CBSprite.rippedBody()
		isMended && this.#CBSprite.mendedStitch(aIdx)
	}
	#foot0() {
		const {ctx}= this
		ctx.lineTo(-42, 41)
		ctx.lineTo(-29, 27)
		ctx.quadraticCurveTo(-16, 41, -9, 42)
		ctx.arcTo( -9, 26, -6, 26, 4)
		ctx.arcTo( +9, 26, +9, 31, 4)
		ctx.lineTo(+9, 42)
		ctx.quadraticCurveTo(+16, 41, 29, 27)
		ctx.lineTo(+42, 41)
	}
	#foot1() {
		const {ctx}= this
		ctx.lineTo(-42, 26)
		ctx.bezierCurveTo(-41, 45, -29, 45, -26, 38)
		ctx.bezierCurveTo(-22, 28, -13, 28,  -9, 35)
		ctx.bezierCurveTo( -5, 45,  +5, 45,  +9, 35)
		ctx.bezierCurveTo(+13, 28, +22, 28, +26, 38)
		ctx.bezierCurveTo(+29, 45, +41, 45, +42, 26)
	}
	#eyesLookingUp({isRipped=false}) {
		const {ctx}= this
		for (const v of [-1,+1]) {
			// Eyeballs
			ctx.beginPath()
			ctx.ellipse(19.5*v, -17, 13,17, -8*v*PI/180, -3*PI/4, -PI/4, true)
			ctx.fillStyle = '#FFF'
			ctx.fill()
			// Eyes
			ctx.fillCircle(18.5*v, -26, 8, (isRipped? '#000':Color.GhostEyes))
		}
	}
	#eyesLookingDown() {
		const {ctx}= this
		for (const v of [-1,+1]) {
			// Eyeballs
			ctx.beginPath()
			ctx.ellipse(19*v, -3, 13,17, 0, 40*PI/180, 140*PI/180, true)
			ctx.fillStyle = '#FFF'
			ctx.fill()
			// Eyes
			ctx.fillCircle(19*v, 4, 8, Color.GhostEyes)
		}
	}
	/** @param {{orient:'Left'|'Right'}} orient */
	#eyesLookingLR({orient}) {
		const {ctx}= this
		ctx.save()
		ctx.scale(Vec2[orient].x, 1)
		for (const i of [0,1]) {
			// Eyeballs
			ctx.beginPath()
			ctx.ellipse([-16.5, 23][i], -11, 13,17, 0,0, PI*2)
			ctx.fillStyle = '#FFF'
			ctx.fill()
			// Eyes
			ctx.fillCircle([-9.5, 29][i], -8,8, Color.GhostEyes)
		}
		ctx.restore()
	}
	#frightFace({spriteIdx=0}) {
		const {ctx}= this
		ctx.fillStyle = ctx.strokeStyle = Color.FrightFaceTable[spriteIdx]
		{// Eyes
			const size = 11
			ctx.fillRect(-15-size/2, -11-size/2, size, size)
			ctx.fillRect(+15-size/2, -11-size/2, size, size)
		}
		// Mouth
		ctx.newLinePath([-36,17],[-30, 9],[-25, 9],[-15,17],[-11,17],[-3, 9])
		ctx.addLinePath([ +3, 9],[+11,17],[+15,17],[+25, 9],[+30, 9],[36,17])
		ctx.lineWidth = 5
		ctx.lineCap = ctx.lineJoin = 'round'
		ctx.stroke()
	}
	#angryGlow({x=0,y=0, isAngry=false, size=T*2}) {
		if (!isAngry) return
		const {width:W}=Glow, S=W*1.2
		Ctx.save()
		Ctx.globalAlpha = this.#resurrect?.alpha ?? 1
		Ctx.translate(x+size/4, y+size/4)
		Ctx.drawImage(Glow, 0,0, W,W, -S/2,-S/2, S,S)
		Ctx.restore()
	}
}
const Glow = function() {
	const {ctx,w,h}= canvas2D(null, T*5)
	ctx.filter = `blur(${T*0.6}px)`
	ctx.fillCircle(w/2, h/2, T, '#F00')
	return ctx.canvas
}()
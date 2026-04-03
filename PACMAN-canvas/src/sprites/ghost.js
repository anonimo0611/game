import CBSprite from './ghost_cb.js'
export const GhostScale = 1.1
export default class GhostSprite {
	/** @readonly */tgt
	/** @readonly */ctx
	/** @readonly */sub
	/** @param {EnhancedCtx2D} target */
	constructor(target, w=T*3, h=T*2) {
		this.tgt = target
		this.ctx = canvas2D(null, w, h).ctx
		this.sub = new CBSprite(this.ctx)
	}
	#resurrect = /**@type {?Fade}*/(null)
	setResurrect() {
		this.#resurrect ||= Fade.in(600)
	}
	draw({
		x=0,y=0,
		type         = 0,
		animIdx      = 0,
		spriteIdx    = 0,
		size         = T*2,
		alpha        = 1,
		orient       = /**@type {Direction|'Bracket'}*/(L),
		isAngry      = false,
		isFrightened = false,
		isEscaping   = false,
		isRipped     = false,
		isMended     = false,
		isExposed    = false,
	}={}) {
		const {tgt,ctx}= this
		function finalize() {
			ctx.restore()
			tgt.save()
			tgt.setAlpha(alpha)
			tgt.translate(x+size/4, y+size/4)
			tgt.drawImage(ctx.canvas, -size/2, -size/2)
			tgt.restore()
		}
		ctx.clear()
		ctx.save()
		ctx.translate(size/2)
		ctx.scale(size/100)
		ctx.scale(GhostScale)
		ctx.lineWidth = 5
		ctx.lineJoin  = ctx.lineCap = 'round'
		ctx.fillStyle = !isFrightened
			? GhostColors[type]
			: Palette.FrightBody[spriteIdx]

		if (isExposed) {
			this.sub.drawHadake(animIdx)
			return finalize()
		}
		if (!isEscaping) {
			ctx.save()
			this.#resurrect?.apply(ctx)
			isAngry && this.#drawAngerGlow({x,y,size})
			this.#drawBody({animIdx,isRipped,isMended})
			if (isFrightened) {
				ctx.fillStyle   =
				ctx.strokeStyle = Palette.FrightFace[spriteIdx]
				this.#drawFrightFace()
			}
			ctx.restore()
		}
		(()=> {
			if (isFrightened) return
			ctx.fillStyle = '#FFF'
			switch(orient) {
			case 'Left':   return this.#drawEyesHoriz(L)
			case 'Right':  return this.#drawEyesHoriz(R)
			case 'Up':     return this.#drawEyesUp(isRipped)
			case 'Down':   return this.#drawEyesDown()
			case 'Bracket':return this.sub.drawBracketEyes()
			}
		})()
		finalize()
	}
	update() {
		if (this.#resurrect?.update() == false)
			this.#resurrect = null
	}
	#drawBody({animIdx=0, isRipped=false, isMended=false}) {
		const {ctx}= this
		ctx.beginPath()
		ctx.moveTo(+42, +26)
		ctx.lineTo(+42, +11)
		ctx.bezierCurveTo(+42,-60, -42,-60, -42,11)
		ctx.lineTo(-42, +26)
		animIdx == 0
			? this.#drawFoot0()
			: this.#drawFoot1()
		ctx.fill()
		isRipped && this.sub.drawHalfNakedBody()
		isMended && this.sub.drawMendedSeam(animIdx)
	}
	#drawFoot0() {
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
	#drawFoot1() {
		const {ctx}= this
		ctx.lineTo(-42, 26)
		ctx.bezierCurveTo(-41, 45, -29, 45, -26, 38)
		ctx.bezierCurveTo(-22, 28, -13, 28,  -9, 35)
		ctx.bezierCurveTo( -5, 45,  +5, 45,  +9, 35)
		ctx.bezierCurveTo(+13, 28, +22, 28, +26, 38)
		ctx.bezierCurveTo(+29, 45, +41, 45, +42, 26)
	}
	#drawEyesUp(isRipped=false) {
		const {ctx}= this, color=[Color.GhostEyes,'#000'][+isRipped]
		for (const v of [-1,+1]) {
			ctx.beginPath()
			ctx.ellipse(19.5*v, -17, 13, 17, -8*v*PI/180, -PI/4, -3*PI/4)
			ctx.fill()
			ctx.fillCircle(18.5*v, -26,  8, color)
		}
	}
	#drawEyesDown() {
		const {ctx}= this
		for (const v of [-1,+1]) {
			ctx.beginPath()
			ctx.ellipse(19*v, -3, 13, 17, 0, 140*PI/180, 40*PI/180)
			ctx.fill()
			ctx.fillCircle(19*v, +4,  8, Color.GhostEyes)
		}
	}
	/** @param {Horizontal} LorR */
	#drawEyesHoriz(LorR) {
		const {ctx}= this, v = (Vec2[LorR].x < 0 ? -1:1)
		for (const i of [0,1]) {
			ctx.beginPath()
			ctx.ellipse([-16.5*v, 23*v][i], -11, 13, 17, 0, 0, PI*2)
			ctx.fill()
			ctx.fillCircle([ -9.5*v, 29*v][i],  -8,  8, Color.GhostEyes)
		}
	}
	#drawFrightFace() {
		const {ctx}= this
		{// Eyes
			const size = 11
			ctx.fillRect(-15-size/2, -size*1.5, size, size)
			ctx.fillRect(+15-size/2, -size*1.5, size, size)
		}
		// Mouth
		ctx.newLinePath([-36,17],[-30, 9],[-25, 9],[-15,17],[-11,17],[-3, 9])
		ctx.addLinePath([ +3, 9],[+11,17],[+15,17],[+25, 9],[+30, 9],[36,17])
		ctx.stroke()
	}
	#drawAngerGlow({x=0,y=0,size=T*2}) {
		const {tgt}=this, {width:W}=Glow, S=W*1.2
		tgt.save()
		tgt.globalAlpha = this.#resurrect?.alpha ?? 1
		tgt.translate(x+size/4, y+size/4)
		tgt.drawImage(Glow, 0,0, W,W, -S/2,-S/2, S,S)
		tgt.restore()
	}
}
const Glow = function() {
	const {ctx,w,h}= canvas2D(null, T*5)
	ctx.filter = `blur(${T*0.6}px)`
	ctx.fillCircle(w/2, h/2, T, '#F00')
	return ctx.canvas
}()
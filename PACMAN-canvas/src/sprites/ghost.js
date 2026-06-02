import SubSprite from './ghost_sub.js'
export const LOGICAL_SIZE = 90
export default class GhostSprite {
	/**@readonly*/tgt
	/**@readonly*/ctx
	/**@readonly*/sub
	#size
	#fadeBody = /**@type {?Fade}*/(null)

	/**
	 @param {EnhancedCtx2D} target
	 @param {number} size
	*/
	constructor(target, size) {
		this.tgt = target
		this.ctx = canvas2D(null).ctx
		this.sub = new SubSprite(this.ctx)
		this.resize(this.#size = size)
	}
	get size()  {return this.#size}
	get alpha() {return this.#fadeBody?.alpha}
	setResurrect() {this.#fadeBody ||= Fade.in(600)}
	resize(/**@type {number}*/size) {
		this.#size = size
		this.ctx.resize(size*1.5, size)
	}
	draw({
		center ={x:0,y:0},
		type         = 0,
		animIdx      = 0,
		spriteIdx    = 0,
		alpha        = 1,
		orient       = /**@type {VisualOrient}*/(L),
		isAngry      = false,
		isFrightened = false,
		isEscaping   = false,
		isRipped     = false,
		isMended     = false,
		isExposed    = false,
	}={}) {
		const {tgt,ctx,size}= this
		ctx.clear()
		ctx.save()
		ctx.translate(size/2)
		ctx.scale(size/LOGICAL_SIZE)
		ctx.lineWidth = 5
		ctx.lineJoin  = ctx.lineCap = 'round'
		ctx.fillStyle = !isFrightened
			? Color.GhostBodies[type]
			: Color.GhostBodies[GhostType.Max+spriteIdx]

		const drawBody = ()=> {
			if (!isEscaping) {
				ctx.save()
				ctx.setAlpha(this.alpha)
				isAngry && tgt.put(Glow,center,this.alpha)
				this.#drawBody({animIdx,isRipped,isMended})
				ctx.restore()
			}
			!isFrightened
				? this.#drawEyes(orient,isRipped)
				: this.#drawFrightFace(spriteIdx)
		}
		isExposed? this.sub.drawHadake(animIdx) : drawBody()
		ctx.restore()
		tgt.put(ctx.canvas, center, alpha, -size/2)
	}
	update() {
		if (this.#fadeBody?.update() == false)
			this.#fadeBody = null
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
		isRipped && this.sub.drawRippedBody()
		isMended && this.sub.drawMendedSeam(animIdx)
	}
	#drawFoot0() {
		const {ctx}= this
		ctx.lineTo(-42, 42)
		ctx.lineTo(-28, 28)
		ctx.quadraticCurveTo(-14, 41, -9, 42)
		ctx.arcTo( -9, 28, -6, 28, 4)
		ctx.arcTo( +9, 28, +9, 31, 4)
		ctx.lineTo(+9, 42)
		ctx.quadraticCurveTo(+14, 41, 28, 28)
		ctx.lineTo(+42, 42)
	}
	#drawFoot1() {
		const {ctx}= this
		ctx.lineTo(-42, 26)
		ctx.bezierCurveTo(-41, 42, -29, 42, -26, 38)
		ctx.bezierCurveTo(-22, 28, -13, 28,  -9, 35)
		ctx.bezierCurveTo( -5, 42,  +5, 42,  +9, 35)
		ctx.bezierCurveTo(+13, 28, +22, 28, +26, 38)
		ctx.bezierCurveTo(+29, 42, +41, 42, +42, 26)
	}
	/** @param {VisualOrient} orient */
	#drawEyes(orient, isRipped=false) {
		this.ctx.fillStyle = '#FFF',
		{
			Left:  ()=> this.#drawEyesHoriz(L),
			Right: ()=> this.#drawEyesHoriz(R),
			Up:    ()=> this.#drawEyesUp(isRipped),
			Down:  ()=> this.#drawEyesDown(),
			Dazed: ()=> this.sub.drawDazedEyes(),
		}[orient]()
	}
	/** @param {Horizontal} LorR */
	#drawEyesHoriz(LorR) {
		const {ctx}= this, vx = (Vec2[LorR].x < 0 ? -1:1)
		for (const i of [0,1]) {
			ctx.beginPath()
			ctx.ellipse([-16.5*vx, 23*vx][i], -11, 13, 17, 0, 0, PI*2)
			ctx.fill()
			ctx.fillCircle([-9.5*vx, 29*vx][i], -8, 8, Color.GhostEye)
		}
	}
	#drawEyesUp(isRipped=false) {
		const {ctx}= this, color=[Color.GhostEye,'#000'][+isRipped]
		for (const vx of [-1,+1]) {
			ctx.beginPath()
			ctx.ellipse(19.5*vx, -17, 13, 17, -8*vx*PI/180, -PI/4, -3*PI/4)
			ctx.fill()
			ctx.fillCircle(18.5*vx, -26, 8, color)
		}
	}
	#drawEyesDown() {
		const {ctx}= this
		for (const vx of [-1,+1]) {
			ctx.beginPath()
			ctx.ellipse(19*vx, -3, 13, 17, 0, 140*PI/180, 40*PI/180)
			ctx.fill()
			ctx.fillCircle(19*vx, +4, 8, Color.GhostEye)
		}
	}
	#drawFrightFace(spriteIdx=0) {
		const {ctx}= this
		ctx.fillStyle   =
		ctx.strokeStyle = Color.FrightFaces[spriteIdx]
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
}
const Glow = function() {
	const {ctx,w,h}= canvas2D(null, T*6)
	ctx.filter = `blur(${T*0.6}px)`
	ctx.fillCircle(w/2, h/2, T, '#F00')
	return ctx.canvas
}()
import {LOGICAL_SIZE} from './ghost.js'

export const AkaSnagX = BW/2 + T/2
export const AkaStopX = AkaSnagX - T

// Assumes actors are vertically centered on the board
export const StakeSize  = Vec2.fixed(T*.18, T*.7)
export const SnaggedPos = Vec2.fixed(BW/2+T*2-StakeSize.x/2, BH/2+T)

export class SnagSprite {
	/** @readonly */ctx
	/** @param {EnhancedCtx2D} ctx */
	constructor(ctx) {this.ctx = ctx}

	drawSnaggedStake({pos=SnaggedPos,isRipped=false,scale=1}={}) {
		const {ctx}= this, [sw,sh]= StakeSize.vals
		ctx.save()
		ctx.translate(pos)
		// Offset for sprite bottom padding
		ctx.translate(0, -T*0.1)
		ctx.scale(scale)
		ctx.fillRect(0,-sh, sw,sh, 'white')
		if (isRipped) {
			ctx.translate(sw, 0)
			ctx.fillPolygon(Color.Akabei, [0,-4],[0,-sh],[-T,0],[-4,0],[-4,-4])
		}
		ctx.restore()
	}

	/**
	 @param {number} animIdx
	 @param {number} ratio
	 @param {{x?:number, y?:number, scale?:number}} options
	*/
	drawSnaggedClothing(animIdx, ratio, {x=0,y=0,scale=1}={}) {
		const {ctx}= this
		const v1 = lerp(-2,  5, ratio)
		const v2 = lerp(+4, 22, ratio)
		const v3 = lerp(+4, 50, ratio)
		const ls = (animIdx? -25 : -36) // Left side
		ctx.save()
		ctx.translate(x, y)
		ctx.scale(T*2*scale/LOGICAL_SIZE)
		ctx.beginPath()
		ctx.moveTo(-8, -10)
		ctx.quadraticCurveTo(-8, -4, v1, 3)
		ctx.quadraticCurveTo(v2, 9, v3, 9)
		ctx.addLinePath([v3,42],[ls,42],[ls,20],[-8,20])
		ctx.fillStyle = Color.Akabei
		ctx.fill()
		ctx.restore()
	}
}
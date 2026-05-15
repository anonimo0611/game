const StakeSize = Vec2.fixed(T*.18, T*.7)
const STAKE_X   = BW/2 + T*2 - StakeSize.x/2
const AKA_COLOR = Color.GhostBodies[GhostType.Akabei]

import {LOGICAL_SIZE} from './ghost.js'
export const SNAG_X = BW/2 + T/2
export const STOP_X = SNAG_X - T
export class SnagSprite {
	/** @readonly */ctx
	/** @param {EnhancedCtx2D} ctx */
	constructor(ctx) {this.ctx = ctx}

	/** Renders the stake bottom-aligned to the given y-coord. */
	drawSnaggedStake({x=STAKE_X,y=0,isRipped=false,scale=1}={}) {
		const {ctx}= this, [sw,sh]= StakeSize.vals
		/** Adjust for the gap between the sprite bottom and the ground */
		const offsetY = -T*0.1
		ctx.save()
		ctx.translate(x, y)
		ctx.scale(scale)
		ctx.translate(0, offsetY)
		ctx.fillRect(0,-sh, sw,sh, 'white') // Stake
		if (isRipped) { // Scrap of cloth
			const s = sw*0.8
			ctx.translate(sw, 0)
			ctx.fillPolygon(AKA_COLOR, [0,-s],[0,-sh],[-T,0],[-s,0],[-s,-s])
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
		ctx.fillStyle = AKA_COLOR
		ctx.fill()
		ctx.restore()
	}
}
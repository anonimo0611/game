import {ctx}     from './anime.js'
import {View}    from './_main.js'
import GhsSprite from '../src/sprites/ghost.js'

let lastT = -1

const SizeRng = /**@type {HTMLInputElement}*/(byId('sizeRng'))

export let T = 0, [S,GAP] = [0,0]
export const GridSize  = Vec2.new(10,11).freeze()
export const ghsSprite = new GhsSprite(canvas2D(null).ctx)

export function resize()
{
	T = SizeRng.valueAsNumber/2
	if (lastT != T)
	{
		[S,GAP] = [T*2,T*.25],
		ghsSprite.ctx.resize(S*4, S*3)
		Ctx.resize(
			GridSize.x*S+GAP*2,
			GridSize.y*S+GAP*1
		)
		ctx.resize(T*3, T*2.1) && View.draw()
		lastT = T
	}
}
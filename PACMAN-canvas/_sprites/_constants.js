import {Pv}      from './anime.js'
import {View}    from './_main.js'
import GhsSprite from '../src/sprites/ghost.js'

let lastT = -1

const SizeRng = /**@type {HTMLInputElement}*/(byId('sizeRng'))

export let [T,S,GAP] = [0,0,0]
export const GridSize = Vec2.new(10,11).freeze()
export const ghsSprGr = new GhsSprite(Fg)
export const ghsSprPv = new GhsSprite(Pv)

export function resize()
{
	T = SizeRng.valueAsNumber/2
	if (lastT != T)
	{
		[S,GAP] = [T*2,T*.25]
		ghsSprGr.ctx.resize(S*4, S*3)
		ghsSprPv.ctx.resize(S*4, S*3)
		Fg.resize(...GridSize.clone.mul(S).add(GAP*2).vals)
		Pv.resize(T*3.2, T*2.1) && View.draw()
		lastT = T
	}
}

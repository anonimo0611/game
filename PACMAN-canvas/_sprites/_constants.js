import {DorpDown} from '../_lib/menu.js'
import GhsSprite  from '../src/sprites/ghost.js'

let lastTileSize = -1

export const Pv = canvas2D('preview').ctx

export const Menu = new DorpDown('animMenu')
export const Btns = $('.radioButtons input')

export const SizeRng   = /**@type {HTMLInputElement} */(byId('sizeRng'))
export const BrightRng = /**@type {HTMLInputElement} */(byId('brightRng'))
export const ResetBtn  = /**@type {HTMLButtonElement}*/(byId('resetBtn'))

export let  [T,S,GAP] = [0,0,0]
export const GridSize = Vec2.new(10,11).freeze()
export const ghsSprPv = new GhsSprite(Pv)
export const ghsSprGr = new GhsSprite(Fg)

export function resize() {
	T = SizeRng.valueAsNumber/2
	if (lastTileSize != T) {
		[S,GAP] = [T*2,T*.25]
		ghsSprPv.ctx.resize(S*4, S*3)
		ghsSprGr.ctx.resize(S*4, S*3)
		Pv.resize(T*3.2, T*2.1)
		Fg.resize(...GridSize.clone.mul(S).add(GAP*2).vals)
		lastTileSize = T
		$(SizeRng).trigger('resize')
	}
}
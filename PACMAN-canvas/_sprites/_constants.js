import {DorpDown}  from '@lib/menu.js'
import GhostSprite from '@src/sprites/ghost.js'

export const Pv = canvas2D('preview').ctx
export const AnimMenu  = new DorpDown('animMenu')
export const $dirBtns  = $('.dirButtons input')
export const sizeRng   = reqInput ('#sizeRng')
export const brightRng = reqInput ('#brightRng')
export const resetBtn  = reqButton('#resetBtn')

/** Tile Gap */
export let GAP = 0

/** Tile Size  */
export let TS = 0

/** Actor Size */
export let AS = 0

export const GridSize = vec2(10,11).vals
export const ghostPv  = new GhostSprite(Pv,TS*2)
export const ghostGr  = new GhostSprite(Fg,TS*2)

export function onResize() {
	TS  = sizeRng.valueAsNumber/2
	AS  = TS*2.00
	GAP = TS*0.25
	ghostPv.resize(AS)
	ghostGr.resize(AS)
	Pv.resize(TS*3.2, TS*2.1)
	Fg.resize(...vec2(GridSize).mul(AS).add(GAP*2).vals)
	$(sizeRng).trigger('resize')
}
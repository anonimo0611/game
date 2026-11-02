import {DorpDown}  from '../_lib/menu.js'
import GhostSprite from '../src/sprites/ghost.js'

let lastTileSize = -1

export const Pv = canvas2D('preview').ctx

export const Menu = new DorpDown('animMenu')
export const Btns = $('.radioButtons input')

export const sizeRng   = reqInput ('#sizeRng')
export const brightRng = reqInput ('#brightRng')
export const resetBtn  = reqButton('#resetBtn')

export let  [T,S,GAP] = [0,0,0]
export const GridSize = new Vec2(10,11).vals
export const ghostPv  = new GhostSprite(Pv,T*2)
export const ghostGr  = new GhostSprite(Fg,T*2)

export function resize() {
	T = sizeRng.valueAsNumber/2
	;[S,GAP] = [T*2,T*.25]
	ghostPv.resize(S)
	ghostGr.resize(S)
	Pv.resize(T*3.2, T*2.1)
	Fg.resize(...Vec2.new(GridSize).mul(S).add(GAP*2).vals)
	lastTileSize = T
	$(sizeRng).trigger('resize')
}
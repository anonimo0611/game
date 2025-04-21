import {PvC}    from './anime.js'
import {View}   from './_main.js'
import {Ghost}  from './actor.js'
import {Akabei} from './actor.js'

export const sizeRng  = byId('sizeRng')
export const GridSize = Vec2(10,11).freeze()

export let T=0,[S,Gap]=[0,0]
export let ghost = new Ghost
export let cbAka = new Akabei

function resize() {
	T = sizeRng.valueAsNumber/2,
	[S,Gap] = [T*2,T*.25]
	ghost = new Ghost (T*2)
	cbAka = new Akabei(T*2)
	Ctx.resize(GridSize.x*S+Gap*2, GridSize.y*S+Gap)
	PvC.resize(T*3, T*2), View.draw()
}
$(sizeRng).on({input:resize}) && $ready(resize)
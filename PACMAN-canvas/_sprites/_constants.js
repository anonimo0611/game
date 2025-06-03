import {PvC}   from './anime.js'
import {View}  from './_main.js'
import {Ghost} from './actor.js'

export let T=0,[S,Gap]=[0,0]
export let ghost = new Ghost(0)

export const GridSize = Vec2(10,11).freeze()
export const sizeRng  = /**@type HTMLInputElement*/(byId('sizeRng'))

let lastT = T
function resize() {
	T = sizeRng.valueAsNumber/2
	if (lastT != T) {
		[S,Gap]=[T*2,T*.25], ghost=new Ghost(T*2)
		Ctx.resize(GridSize.x*S+Gap*2, GridSize.y*S+Gap*1)
		PvC.resize(T*3, T*2) && View.draw()
		lastT = T
	}
}
Ticker.set(resize)
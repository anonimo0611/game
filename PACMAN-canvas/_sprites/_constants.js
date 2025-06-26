import {PvC}   from './anime.js'
import {View}  from './_main.js'
import {Ghost} from './actor.js'

export let _t=0,[_s,_gap]=[0,0]; let lastT=_t
export let _ghost = new Ghost(0)

export const GridSize = Vec2(10,11).freeze()
export const sizeRng  = /**@type {HTMLInputElement}*/(byId('sizeRng'))

export function resize() {
	_t = sizeRng.valueAsNumber/2
	if (lastT != _t) {
		[_s,_gap]=[_t*2,_t*.25], _ghost=new Ghost(_t*2)
		Ctx.resize(
			GridSize.x*_s+_gap*2,
			GridSize.y*_s+_gap*1)
		PvC.resize(_t*3, _t*2) && View.draw()
		lastT = _t
	}
}
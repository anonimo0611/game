import {ctx}   from './anime.js'
import {View}  from './_main.js'
import {Ghost} from './actor.js'

let lastT = -1

export let T = 0, [S,gap]=[0,0]
export let ghost = new Ghost(0)
export const GridSize = Vec2(10,11).freeze()

const SizeRng =
/**@type {HTMLInputElement}*/(byId('sizeRng'))

export function resize()
{
	T = SizeRng.valueAsNumber/2
	if (lastT != T)
	{
		[S,gap]=[T*2,T*.25],
		ghost = new Ghost(T*2)
		Ctx.resize(
			GridSize.x*S+gap*2,
			GridSize.y*S+gap*1
		)
		ctx.resize(T*3, T*2) && View.draw()
		lastT = T
	}
}
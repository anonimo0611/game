import {PvC}  from './anime.js'
import {View} from './_main.js'
import GhsSprite   from '../src/sprites/ghost.js'
import GhsSpriteCb from '../src/sprites/ghost_cb.js'

class Ghost {
	/** @param {number} size */
	constructor(size) {
		this.idx      = 0
		this.size     = size
		this.sprite   = new GhsSprite(canvas2D(null, size*4, size*3).ctx)
		this.cbSprite = GhsSpriteCb
	}
}
export const sizeRng  = byId('sizeRng')
export const GridSize = Vec2(10,11).freeze()

export let T=0,[S,Gap]=[0,0]
export let ghost = new Ghost(0)

function resize() {
	T = sizeRng.valueAsNumber/2,
	[S,Gap]=[T*2,T*.25], ghost=new Ghost(T*2)
	Ctx.resize(GridSize.x*S+Gap*2, GridSize.y*S+Gap*1)
	PvC.resize(T*3, T*2) && View.draw()
}
$(sizeRng).on({input:resize}) && $ready(resize)
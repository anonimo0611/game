import {Vec2}  from '../_lib/vec2.js'
import {BgCtx} from './_canvas.js'
import {State} from './_state.js'
import {Ctrl}  from './control.js'
import {Form}  from './control.js'
import Sprite  from './pacman/pac_sprite.js'
import {TileSize as T} from './_constants.js'

export const Lives = new class {
	static {
		$(Form.lvsRng).on('input', ()=> Lives.#set())
		$on('Title Start Ready Restart', ()=> Lives.#set())
	}
	#left = 0
	get left() {return Lives.#left}
	get Max()  {return Ctrl.livesMax-1}
	#setCurrent() {
		const {left,Max}=Lives
		return this.#left = +{
			Title:  Max,
			Start:  Max+1,
			Ready:  State.lastIs('Start')? Max:left,
			Restart:left-1,
		}[State.current]
	}
	#draw(left=Lives.#setCurrent()) {
		const sprite = new Sprite({Radius:T*.78,opening:1})
		BgCtx.save()
		BgCtx.translate(T*2, T*32)
		BgCtx.clearRect(0,0, T*2*5, T*2)
		for (let i=0; i<left; i++)
			sprite.draw(BgCtx, Vec2(T*2*i,0).add(T))
		BgCtx.restore()
	}
	#set()   {Lives.#draw()}
	append() {Lives.#draw(++Lives.#left)}
}
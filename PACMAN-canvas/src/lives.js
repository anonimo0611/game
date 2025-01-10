import {Vec2}  from '../_lib/vec2.js'
import {BgCtx} from './_canvas.js'
import {State} from './_state.js'
import {Ctrl}  from './control.js'
import {Form}  from './control.js'
import Sprite  from './pacman/pac_sprite.js'
import {TileSize as T} from './_constants.js'

export const Lives = new class {
	static {
		const set = ()=> Lives.#set()
		$(Form.lvsRng).on('input', set)
		$on('Title Start Ready Restart', set)
	}
	#left = 0
	get left() {return Lives.#left}
	get Max()  {return Ctrl.livesMax-1}
	#setCurrent() {
		const {left,Max}=Lives
		return this.#left = +{
			'Title':  Max,
			'Start':  Max+1,
			'Ready':  State.lastIs('Start')? Max:left,
			'Restart':left-1,
		}[State.current]
	}
	#draw(left=Lives.#setCurrent()) {
		const Size   = T * 2
		const Radius = T * 0.78
		const sprite = new Sprite({Radius}, {closed:false})
		BgCtx.save()
		BgCtx.translate(T*2, T*32)
		BgCtx.clearRect(0,0, Size*5, Size)
		for (let i=0; i<left; i++)
			sprite.draw(BgCtx, Vec2(Size*i+T, T))
		BgCtx.restore()
	}
	#set()   {Lives.#draw()}
	append() {Lives.#draw(++Lives.#left)}
}
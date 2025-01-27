import {Vec2}  from '../_lib/vec2.js'
import {BgCtx} from './_canvas.js'
import {State} from './_state.js'
import {Ctrl}  from './control.js'
import {Form}  from './control.js'
import Sprite  from './pacman/pac_sprite.js'
import {TileSize as T} from './_constants.js'

export const Lives = function() {
	let left = 0
	function currentValue(max) {
		return left = +{
			Title:  max,
			Start:  max+1,
			Ready:  State.lastIs('Start')? max:left,
			Restart:left-1,
		}[State.current]
	}
	function set(left=currentValue(Ctrl.livesMax-1)) {
		const sprite = new Sprite({openType:1})
		BgCtx.save()
		BgCtx.translate(T*2, T*32)
		BgCtx.clearRect(0,0, T*2*5, T*2)
		for (let i=0; i<left; i++) {
			const centerPos = Vec2(T*2*i,0).add(T)
			sprite.draw(BgCtx, {radius:T*.78,centerPos})
		}
		BgCtx.restore()
	}
	$(Form.lvsRng).on('input', ()=> set())
	$on('Title Start Ready Restart', ()=> set())
	return {
		get left() {return left}, append() {set(++left)}
	}
}()
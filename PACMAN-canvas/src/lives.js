import {State} from './_state.js'
import {Ctrl}  from './control.js'
import {Form}  from './control.js'
import Sprite  from './pacman/pac_sprite.js'

export const Lives = function() {
	let left = 0
	function currentValue() {
		const max = Ctrl.livesMax-1
		return +{
			Title:  max,
			Start:  max+1,
			Ready:  State.lastIs('Start')? max:left,
			Restart:left-1,
		}[State.current]
	}
	function set(val=currentValue()) {
		const sprite = new Sprite(Bg.ctx,{openType:1})
		Bg.ctx.save()
		Bg.ctx.translate(T*2, T*32)
		Bg.ctx.clearRect(0,0, T*2*5, T*2)
		for (let i=0; i<(left=val); i++) {
			const centerPos = Vec2(T*2*i,0).add(T)
			sprite.draw({radius:T*.78,centerPos})
		}
		Bg.ctx.restore()
	}
	$(Form.lvsRng).on('input', ()=> set())
	$on('Title Start Ready Restart', ()=> set())
	return {
		get left() {return left},
		append() {set(++left)}
	}
}()
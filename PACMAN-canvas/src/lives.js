import {State} from './state.js'
import {Ctrl}  from './control.js'
import Sprite  from './sprites/pacman.js'

export const Lives = function() {
	let _left = 0
	function currentValue() {
		const max = Ctrl.livesMax-1
		switch(State.current) {
		case 'Title':  return max
		case 'Start':  return max+1
		case 'Ready':  return State.last('Start')? max:_left
		case 'Restart':return _left-1
		default: return 0
		}
	}
	function set(val=currentValue()) {
		const {ctx}  = HUD
		const radius = T*.78, size = T*2
		const sprite = new Sprite(ctx, 1)
		ctx.save()
		ctx.translate(size, CvsH-size)
		ctx.clearRect(0,0, size*5, size)
		for (let i=0,max=(_left=val); i<max; i++)
			sprite.draw({radius,centerPos:Vec2(size*i+T,T)})
		ctx.restore()
	}
	$('#lvsRng').on({input:()=> set()})
	$on({Title_Start_Ready_Restart:()=> set()})

	return {
		get left(){return _left},
		append:()=> set(++_left),
	}
}()
import {State} from './state.js'
import {Ctrl}  from './control.js'
import Sprite  from './sprites/pacman.js'

export const Lives = function() {
	let   _left  = 0
	const {ctx}  = HUD
	const radius = T*.78, size = T*2
	const sprite = new Sprite(ctx,1)

	function onChange() {
		switch(State.current) {
		case 'Title':    return reset()
		case 'Intro':    return add(+1)
		case 'Ready':    return add(State.wasIntro? -1:0)
		case 'Restarted':return add(-1)
		}
	}
	function draw(left=0) {
		ctx.save()
		ctx.translate(size, BH-size)
		ctx.clearRect(0,0, size*5, size)
		for (const i of range(left))
			sprite.draw({radius,center:{x:size*i+T, y:T}})
		ctx.restore()
	}
	function reset()  {draw(_left = Ctrl.livesMax-1)}
	function add(n=0) {draw(_left += n)}

	$('#lvsRng').on({input:onChange})
	State.on({_Intro_Ready_Restarted:onChange})
	return {
		append() {add(1)},
		get left() {return _left},
	}
}()
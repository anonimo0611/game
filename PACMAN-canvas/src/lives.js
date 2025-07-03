import {State} from './state.js'
import {Ctrl}  from './control.js'
import Sprite  from './sprites/pacman.js'

export const Lives = function() {
	let   _left  = 0
	const {ctx}  = HUD
	const radius = T*.78, size = T*2
	const sprite = new Sprite(ctx, 1)
	function onChange() {
		match(State.current, {
			Title:  ()=> _left = Ctrl.livesMax-1,
			Start:  ()=> _left += +1,
			Ready:  ()=> _left += State.last('Start')? -1:0,
			Restart:()=> _left += -1,
		})
		draw()
	}
	function draw() {
		ctx.save()
		ctx.translate(size, CH-size)
		ctx.clearRect(0,0, size*5, size)
		for (const i of range(_left))
			sprite.draw({radius,center:{x:size*i+T, y:T}})
		ctx.restore()
	}
	$('#lvsRng').on({input:onChange})
	State.on({_Start_Ready_Restart:onChange})

	return {
		get left() {return _left},
		append() {++_left;draw()},
	}
}()
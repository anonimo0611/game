import {State} from './state.js'
import {Ctrl}  from './control.js'
import Sprite  from './sprites/pacman.js'

export const Lives = function() {
	let   _left  = 0
	const {ctx}  = HUD
	const Radius = T*.78, Size = T*2
	const sprite = new Sprite(ctx,1)
	function onChange() {
		match(State.current, {
			Title:    ()=> _left = Ctrl.livesMax-1,
			Starting: ()=> _left += +1,
			Ready:    ()=> _left += State.last('Starting')? -1:0,
			Restarted:()=> _left += -1,
		})
		draw()
	}
	function draw() {
		ctx.save()
		ctx.translate(Size, BH-Size)
		ctx.clearRect(0,0, Size*5, Size)
		for (const i of range(_left))
			sprite.draw({radius:Radius, center:{x:Size*i+T, y:T}})
		ctx.restore()
	}
	$('#lvsRng').on({input:onChange})
	State.on({_Starting_Ready_Restarted:onChange})
	return {
		get left() {return _left},
		append() {++_left;draw()},
	}
}()

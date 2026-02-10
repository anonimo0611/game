import {State}  from './state.js'
import {Ctrl}   from './control.js'
import {inputs} from './ui.js'
import Sprite   from './sprites/pacman.js'

export const Lives = function() {
	let   _left  = 0
	const sprite = new Sprite(HUD, 1)
	const radius = T*.78, size = T*2
	State.on({
		Title:()=> reset(),
		Intro:()=> add(+1),
		Ready:()=> add(State.wasNewLevel? 0:-1),
	})
	function draw(left=3) {
		HUD.save()
		HUD.translate(size, BH-size)
		HUD.clearRect(0,0, size*(+inputs.lvsRng.max), size)
		for (const i of range(left))
			sprite.draw({radius,center:{x:size*i+T, y:T}})
		HUD.restore()
	}
	function add(n=0) {draw(_left += n)}
	function reset()  {draw(_left = Ctrl.livesMax-1)}
	$(inputs.lvsRng).on({input:reset})
	return {
		append()   {add(1)},
		get left() {return _left},
	}
}()
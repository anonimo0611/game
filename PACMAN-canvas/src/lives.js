import {State}  from './state.js'
import {Ctrl}   from './control.js'
import {inputs} from './inputs.js'
import Sprite   from './sprites/pacman.js'

export const Lives = function() {
	let _left = 0
	function onChange() {
		switch(State.current) {
		case 'Title':    return reset()
		case 'Intro':    return add(+1)
		case 'Ready':    return add(State.wasIntro? -1:0)
		case 'Restarted':return add(-1)
		}
	}
	function draw(left=0) {
		const sprite = new Sprite(HUD, 1)
		const radius = T*.78, size = T*2
		HUD.save()
		HUD.translate(size, BH-size)
		HUD.clearRect(0,0, size*(+inputs.lvsRng.max), size)
		for (const i of range(left))
			sprite.draw({radius,center:{x:size*i+T, y:T}})
		HUD.restore()
	}
	function reset()  {draw(_left = Ctrl.livesMax-1)}
	function add(n=0) {draw(_left += n)}

	$(inputs.lvsRng).on({input:onChange})
	State.on({_Intro_Ready_Restarted:onChange})
	return {
		append()   {add(1)},
		get left() {return _left},
	}
}()
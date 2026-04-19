import {State}  from './state.js'
import {Ctrl}   from './control.js'
import {inputs} from './ui.js'
import  Sprite  from './sprites/pacman.js'

export const Lives = function() {
	let   left   = 0
	const SIZE   = T*2
	const sprite = new Sprite(HUD, T*.8, 0.5)
	State.on({
		Title:   ()=> reset(),
		NewGame: ()=> add(+1),
		Ready:   ()=> add(State.wasNewLevel? 0:-1),
	})
	function draw(left=3) {
		HUD.save()
		HUD.translate(SIZE, BH-SIZE)
		HUD.clearRect(0,0, SIZE*(+inputs.lvsRng.max), SIZE)
		for (let i=0; i<left; i++)
			sprite.draw({center:{x:SIZE*i+T, y:T}})
		HUD.restore()
	}
	function add(n=0) {draw(left += n)}
	function reset()  {draw(left = Ctrl.livesMax-1)}
	$(inputs.lvsRng).on({input:reset})
	return {
		extend()   {add(1)},
		get left() {return left},
	}
}()
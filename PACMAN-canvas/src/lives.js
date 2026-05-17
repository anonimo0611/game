import {lives} from './ui.js'
import {State} from './state.js'
import  Sprite from './sprites/pacman.js'

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
		HUD.translate(SIZE+T, BH-T)
		HUD.clearRect(-T,-T, SIZE*(+lives.max), SIZE)
		for (let i=0; i<left; i++)
			sprite.draw({center:{x:SIZE*i}})
		HUD.restore()
	}
	function add(n=0) {draw(left += n)}
	function reset()  {draw(left = lives.valueAsNumber-1)}
	$(lives).on({input:reset})
	return {
		extend()   {add(+1)},
		get left() {return left},
	}
}()
import {State}    from './state.js'
import {Cfg}      from './control.js'
import  Sprite    from './sprites/pacman.js'

export const Lives = function() {
	let   left   = 0
	const MAX    = 5
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
		HUD.clearRect(0,0, SIZE*MAX, SIZE)
		for (let i=0; i<left; i++)
			sprite.draw({center:{x:SIZE*i+T, y:T}})
		HUD.restore()
	}
	function add(n=0) {draw(left += n)}
	function reset()  {draw(left = Cfg.initialLives-1)}
	$('#initialLives').on({input:reset})
	return {
		extend()   {add(1)},
		get left() {return left},
	}
}()
import {lives} from './ui.js'
import {State} from './state.js'
import  Sprite from './sprites/pacman.js'

export const Lives = function() {
	let   left = 0
	const SIZE = T * 2
	const sprite = new Sprite(HUD, T*.8, .5)
	State.on({
		Title:   ()=> set(lives.valueAsNumber-1),
		NewGame: ()=> set(left+1),
		Ready:   ()=> set(left+(State.wasNewLevel? 0:-1)),
	})
	function set(/**@type {number}*/v) {
		left = max(0, v)
		draw()
	}
	function draw() {
		HUD.save()
		HUD.translate(SIZE+T, BH-T)
		HUD.clearRect(-T,-T, SIZE*(+lives.max), SIZE)
		for (let i=0; i<left; i++)
			sprite.draw({center:{x:SIZE*i}})
		HUD.restore()
	}
	$(lives).on({input:()=> set(lives.valueAsNumber-1)})

	return {
		extend()   {set(left+1)},
		get left() {return left},
	}
}()
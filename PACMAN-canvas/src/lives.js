import {lives} from '@/ui.js'
import {State} from '@/state.js'
import  Sprite from '@/sprites/pacman.js'

export const Lives = function() {
	let   left   = 0
	const SIZE   = TS*2
	const sprite = new Sprite(HUD, TS*.8, .5)
	State.on({
		Title:   ()=> set(lives.valueAsNumber-1),
		NewGame: ()=> set(left+1),
		Ready:   ()=> set(left+(State.wasNewLevel? 0:-1)),
	})
	function set(/**@type {number}*/v) {
		left = clamp(v, 0, +lives.max);draw()
	}
	function draw() {
		HUD.save()
		HUD.translate(SIZE+TS, BH-TS)
		HUD.clearRect(-TS,-TS, SIZE*(+lives.max), SIZE)
		for (const i of range(0,left))
			sprite.draw({center:{x:SIZE*i}})
		HUD.restore()
	}
	$(lives).on({input:()=> set(lives.valueAsNumber-1)})
	return {
		extend()   {set(left+1)},
		get left() {return left},
	}
}()
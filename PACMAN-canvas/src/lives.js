import {State} from './state.js'
import {Ctrl}  from './control.js'
import Sprite  from './sprites/pacman.js'

/** @typedef {'Title'|'Start'|'Ready'|'Restart'} EvType */

export const Lives = function() {
	let _left = 0
	function onChange() {
		;({
			Title:  ()=> _left = Ctrl.livesMax-1,
			Start:  ()=> _left += 1,
			Ready:  ()=> _left += State.last('Start')? -1:0,
			Restart:()=> _left -= 1,
		})[/**@type EvType*/(State.current)]()
		draw()
	}
	function draw() {
		const {ctx}  = HUD
		const radius = T*.78, size = T*2
		const sprite = new Sprite(ctx,1)
		ctx.save()
		ctx.translate(size, CvsH-size)
		ctx.clearRect(0,0, size*5, size)
		for (let i=0; i<_left; i++)
			sprite.draw({radius,centerPos:Vec2(size*i+T,T)})
		ctx.restore()
	}
	$on({Title_Start_Ready_Restart:onChange})
	$('#lvsRng').on({input:onChange})

	return {
		get left() {return _left},
		append() {++_left;draw()},
	}
}()
import {State} from './state.js'
import {Ctrl}  from './control.js'
import Sprite  from './sprites/pacman.js'

export const Lives = function() {
	let _left = 0
	const EvTypes = /** @type {const} */
		(['Title','Start','Ready','Restart'])
	function currentValue() {
		const Max = Ctrl.livesMax-1
		return {
			Title:  Max,
			Start:  Max+1,
			Ready:  State.last('Start')? Max:_left,
			Restart:_left-1,
		}[/**@type {typeof EvTypes[number]}*/(State.current)]
	}
	function set(val=currentValue()) {
		const {ctx}  = HUD
		const radius = T*.78, size = T*2
		const sprite = new Sprite(ctx,{openType:1})
		ctx.save()
		ctx.translate(size, CvsH-size)
		ctx.clearRect(0,0, size*5, size)
		for (let i=0,max=(_left=val); i<max; i++)
			sprite.draw({radius,centerPos:Vec2(size*i+T,T)})
		ctx.restore()
	}
	$('#lvsRng').on({input:()=> set()})
	$on(EvTypes.join('_'), ()=> set())
	return {
		get left(){return _left},
		append:()=> set(++_left),
	}
}()
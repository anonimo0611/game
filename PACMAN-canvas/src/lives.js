import {State} from './state.js'
import {Ctrl}  from './control.js'
import Sprite  from './sprites/pacman.js'

export const Lives = function() {
	let   _left   = 0
	const EvTypes = /**@type {const}*/
		(['Title','Start','Ready','Restart'])

	function currentValue() {
		const cur = State.current
		const max = Ctrl.livesMax-1
		return {
			Title:  max,
			Start:  max+1,
			Ready:  State.last('Start')? max:_left,
			Restart:_left-1,
		}[/**@type {typeof EvTypes[number]}*/(cur)]
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
	$on(EvTypes.join('_'), ()=> set())
	$('#lvsRng').on({input:()=> set()})

	return {
		get left(){return _left},
		append:()=> set(++_left),
	}
}()
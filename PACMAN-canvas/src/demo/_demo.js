import {Confirm}   from '../../_lib/confirm.js'
import {Ctrl}      from '../control.js'
import {State}     from '../state.js'
import {Attract}   from './attract.js'
import {CoffBreak} from './coffee_break.js'

/** Attract Mode will begin after a period of inactivity. */
const WaiteTime = 1e3*30 // 30secs
const RunTimer  = new class {
	#cnt = 0
	constructor() {
        $win.on(`Title blur focus scroll pointerdown
			mousemove keydown resize wheel`, ()=> this.#cnt = 0)
    }
    update() {
        (!document.hasFocus()
		 || Confirm.opened
		 || Ctrl.activeElem
		)? (this.#cnt = 0)
         : (this.#cnt+=Ticker.Interval) > WaiteTime
		 	&& State.toAttract()
    }
}

/** @typedef {import('state.js').StateType} StateType */
/** @typedef {{update():void,draw?():void}} Scene */
/** @type {{[key in StateType]?:Scene}} */
const Scenes ={Title:RunTimer,Attract,CoffBreak}
export const Demo = {
	get CoffBreakNum() {return CoffBreak.num},
	draw()   {Scenes[State.current]?.draw?.()},
	update() {Scenes[State.current]?.update()},
}
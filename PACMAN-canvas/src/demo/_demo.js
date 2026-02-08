import {Confirm}   from '../../_lib/confirm.js'
import {Ctrl}      from '../control.js'
import {State}     from '../state.js'
import {Attract}   from './attract.js'
import {CoffBreak} from './coffee_break.js'

const Events = 'pointerdown_mousemove_keydown_scroll_resize_wheel'

/** Attract Mode will begin after a period of inactivity. */
const RunTimer = new class {
	#cnt = 0
	constructor() {State.onChange(()=> this.sync())}
	reset()  {this.#cnt = 0}
	pause()  {Ticker.pause(true) && this.reset()}
	resume() {Ticker.pause(false)}
	sync() {
		this.reset()
		!State.isTitle?
			$off('.RunTimer'):
			$onNS('RunTimer', {
				blur:    ()=> this.pause(),
				focus:   ()=> this.resume(),
				[Events]:()=> this.reset(),
			})
	}
	update() {
		(!document.hasFocus() || Confirm.opened || Ctrl.activeElem)
			? this.reset()
		 	: (this.#cnt+=Ticker.Interval) > 1e3*30 // 30secs
				&& State.toAttract()
	}
}

/** @type {{[K in import('../state').StateType]?:Scene}} */
const Scenes ={Title:RunTimer,Attract,CoffBreak}
export const Demo = {
	get CoffBreakNum() {return CoffBreak.num},
	draw()   {Scenes[State.current]?.draw?.()},
	update() {Scenes[State.current]?.update()},
}
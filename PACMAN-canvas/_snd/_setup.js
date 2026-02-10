import {inputs}  from '../src/ui.js'
import {Sound}   from './sound.js'
import {Speaker} from './speaker.js'

let  _lstVol  = NaN
const volRng  = inputs.volRng
const volRg2  = inputs.volRg2
const initVol = +(localStorage.anopac_volume ?? 5)

/** Register sound instances and set up controls */
export const Setup = new class {
	onLoaded() {
		Sound.vol = initVol
		$win.on({keydown:Setup.#onKeydown})
		$('#speaker')
			.on({click:Setup.#mute})
			.onWheel(Setup.#onInput)
		$('.volRng')
			.attr({value:initVol,defaultValue:initVol})
			.on({input:Setup.#onInput})
			.trigger('input')
	}
	onFailed() {
		$('.volCtrl').hide()
	}
	#onInput(/**@type {Event}*/e) {
		const isInput = e.target instanceof HTMLInputElement
		Sound.vol = (isInput? e.target:volRng).valueAsNumber
		Speaker.draw(localStorage.anopac_volume = Sound.vol)
	}
	#onKeydown(/**@type {JQuery.KeyDownEvent}*/e) {
		if (keyRepeat(e) || isCombiKey(e))
			return
		if (e.key.toUpperCase() == 'M'
		 || e.target == volRg2 && isEnterKey(e))
		 	Setup.#mute()
	}
	#mute() {
		_lstVol = Sound.vol || (_lstVol || +volRng.max >> 1)
		$(volRng).prop({value:Sound.vol? 0 : _lstVol}).trigger('input')
	}
}
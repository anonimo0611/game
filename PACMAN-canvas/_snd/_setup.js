import {inputs}  from '../src/ui.js'
import {Sound}   from './sound.js'
import {Speaker} from './speaker.js'

let lstVol = NaN

const {volRng,volRg2}= inputs
const initVol = +(localStorage.anopac_volume ?? 5)

export const Setup = new class {
	onSettled(succeeded=true) {
		succeeded
			? Setup.#onLoaded()
			: Setup.#onFailed()
		$root.addClass('sound-settled')
	}
	#onLoaded() {
		$('#speaker')
			.on({click:Setup.#mute})
			.onWheel(Setup.#onInput)
		$('.volRng')
			.attr({value:initVol,defaultValue:initVol})
			.on({input:Setup.#onInput})
			.trigger('input')
		$win.on({keydown:Setup.#onKeydown})
	}
	#onFailed() {
		$('.volCtrl').hide()
	}
	#onInput(/**@type {Event}*/e) {
		const isInput = e.target instanceof HTMLInputElement
		Sound.vol = (isInput? e.target:inputs.volRng).valueAsNumber
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
		lstVol = Sound.vol || (lstVol || +volRng.max >> 1)
		const value = (Sound.vol ? 0 : lstVol)
		$('.volRng').prop({value}) && $(volRng).trigger('input')
	}
}
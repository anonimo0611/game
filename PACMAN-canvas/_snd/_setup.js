import {inputs} from '../src/ui.js'
import {Sound}  from './sound.js'
import {SpeakerRenderer} from './speaker.js'

let lstVol = NaN

const {volRng,volRg2}= inputs
const $speaker  = $('#speaker')
const $volRngs  = $('.volRng')
const $volCtrls = $('.volCtrl')

const speaker = function() {
	const size = $('#volume').height()
	const ctx  = canvas2D('speaker',size).ctx
	return new SpeakerRenderer(ctx,'#FFF')
}()

const SoundCtrl = {
	loaded() {
		const {mute,input,keydown}= this
		$win.on({keydown})
		$volRngs.on({input}).trigger('input')
		$speaker.on({click:mute}).onWheel(input)
	},
	failed() {
		$volCtrls.hide()
	},
	input(/**@type {Event}*/e) {
		const isInput = e.target instanceof HTMLInputElement
		const rngCtrl = (isInput? e.target : inputs.volRng)
		speaker.draw(Sound.vol = rngCtrl.valueAsNumber)
	},
	keydown(/**@type {JQuery.KeyDownEvent}*/e) {
		if (keyRepeat(e) || hasModifierKeys(e))
			return
		if (e.key.toUpperCase() == 'M'
		 || e.target == volRg2 && isEnterKey(e))
			SoundCtrl.mute()
	},
	mute() {
		lstVol = Sound.vol || (lstVol || +volRng.max >> 1)
		$volRngs.prop({value:(Sound.vol ? 0 : lstVol)})
		$(volRng).trigger('input')
	}
}

/** @param {boolean} succeeded */
export function onSettled(succeeded) {
	succeeded
		? SoundCtrl.loaded()
		: SoundCtrl.failed()
	$root.addClass('sound-settled')
}
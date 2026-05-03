import {Sound} from './sound.js'
import {SpeakerRenderer} from './speaker.js'

let lstVol = NaN

const MAX_VOL   = 10
const volRange  = qS('#volRng')
const volRange2 = qS('#volRg2')
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
		if (volRange instanceof HTMLInputElement) {
			const isInput = e.target instanceof HTMLInputElement
			const rngCtrl = (isInput? e.target : volRange)
			speaker.draw(Sound.vol = rngCtrl.valueAsNumber)
		}
	},
	keydown(/**@type {JQuery.KeyDownEvent}*/e) {
		if (keyRepeat(e) || hasModifierKeys(e))
			return
		if (e.key.toUpperCase() == 'M'
		 || e.target == volRange2 && isEnterKey(e))
			SoundCtrl.mute()
	},
	mute() {
		if (volRange) {
			lstVol = Sound.vol || (lstVol || MAX_VOL/2)
			$volRngs.val(Sound.vol ? 0 : lstVol)
			$(volRange).trigger('input')
		}
	}
}

/** @param {boolean} succeeded */
export function onSettled(succeeded) {
	succeeded
		? SoundCtrl.loaded()
		: SoundCtrl.failed()
	$root.addClass('sound-settled')
}
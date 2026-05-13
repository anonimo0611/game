import {Sound} from './sound.js'
import {SpeakerRenderer} from './speaker.js'

let lstVol = NaN

const MAX_VOL   = 10
const $speaker  = $('#speaker')
const $volRngs  = $('.volRng')
const $volCtrls = $('.volCtrl')

const speaker = function() {
	const size = $('#volume').height()
	const ctx  = canvas2D('speaker',size).ctx
	return new SpeakerRenderer(ctx,'#FFF')
}()

const Ctrl = {
	loaded() {
  		const {input,keydown,mute}= this
		$win.on({keydown})
		$volRngs.on({input}).trigger('input')
		$speaker.on({click:mute})
	},
	failed() {
		$volCtrls.hide()
	},
	input(/**@type {JQTriggeredEvent}*/e) {
		if (e.target instanceof HTMLInputElement)
			Ctrl.setVolume(e.target.valueAsNumber)
	},
	setVolume(/**@type {number}*/val) {
		Sound.vol = val
		$volRngs.val(val)
		speaker.draw(val)
	},
	mute() {
 		lstVol = Sound.vol || (lstVol || MAX_VOL/2)
  		$volRngs.val(Sound.vol? 0 : lstVol).trigger('input')
	},
	keydown(/**@type {JQKeyboardEvent}*/e) {
		if (keyRepeat(e) || hasModifierKeys(e)) return
		const isMKey = e.key.toUpperCase() == 'M'
		const isEnterOnRng = $(e.target).hasClass('volRng') && isEnterKey(e)
		if (isMKey || isEnterOnRng) {
			e.preventDefault()
			Ctrl.mute()
		}
	}
}

/** @param {boolean} succeeded */
export function onSettled(succeeded) {
	succeeded
		? Ctrl.loaded()
		: Ctrl.failed()
	$root.addClass('sound-settled')
}
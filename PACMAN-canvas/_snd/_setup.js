import {Sound} from './sound.js'
import {SpeakerRenderer} from './speaker.js'

const MAX_VOL = 10
const SETTLED = 'sound-settled'

/** @returns {void} */
export function onSettled(succeeded=false) {
	if ($root.hasClass(SETTLED))
		return
	if (!succeeded)
		return void $('.volCtrl').hide()

	const $speaker = $('#speaker')
	const $volRngs = $('.volRng')
	const speaker  = new SpeakerRenderer(
		canvas2D('speaker', $('#volume').height()).ctx, '#FFF'
	)

	let lstVol = NaN
	function mute() {
		lstVol = Sound.vol || (lstVol || MAX_VOL/2)
		$volRngs.val(Sound.vol? 0 : lstVol).trigger('input')
	}

	/** @param {number} val */
	function setVolume(val) {
		Sound.vol = val
		$volRngs.val(val)
		$volRngs.attr('title',val)
		speaker.draw(val)
	}

	/** @param {JQTriggeredEvent} e  */
	function input(e) {
		if (e.target instanceof HTMLInputElement)
			setVolume(e.target.valueAsNumber)
	}

	/** @param {JQKeyboardEvent} e  */
	function keydown(e) {
		if (keyRepeated(e) || hasModifierKeys(e))
			return
		const isMKey  = e.key.toUpperCase() == 'M'
		const isRange = $(e.target).hasClass('volRng')
		if (isMKey || isRange && isActionKey(e)) {
			e.preventDefault(), mute()
		}
	}
	$win.on({keydown})
	$volRngs.on({input}).trigger('input')
	$speaker.on({click:mute})
	$root.addClass(SETTLED)
}
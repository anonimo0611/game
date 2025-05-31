import {ctrl}  from '../src/control.js'
import {Sound} from "./sound.js"

let   lstVol = NaN
const volRng = ctrl('volRng')
const volRg2 = ctrl('volRg2')

addEventListener('load', ()=> {
	if (Sound.disabled) {
		$('.volCtrl').hide()
		return
	}
	$on({keydown:onKeydown})
	$('#speaker')
		.on({wheel:onWheel})
		.on({click:mute})
	$('.volRng')
		.prop({defaultValue:Sound.vol})
		.on({input:onWheel})
})
function mute() {
	lstVol = Sound.vol || (lstVol || +volRng.max >> 1)
	$(volRng)
		.prop({value:(Sound.vol? 0 : lstVol)})
		.trigger('input')
}
function onWheel(/**@type {MouseEvent}*/e) {
	const isInputElem = e.target instanceof HTMLInputElement
	Sound.vol = (isInputElem? e.target : volRng).valueAsNumber
}
function onKeydown(/**@type {KeyboardEvent}*/e) {
	if (keyRepeat(e) || isCombinationKey(e))
		return
	if (e.key.toUpperCase() == 'M'
	 || e.target == volRg2 && isEnterKey(e))
		mute()
}
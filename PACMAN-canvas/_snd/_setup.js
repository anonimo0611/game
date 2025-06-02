import {ctrl}     from '../src/control.js'
import {Sound}    from "./sound.js"
import {SoundMgr} from './loader.js'

let   lstVol = NaN
const volRng = ctrl('volRng')
const volRg2 = ctrl('volRg2')

;(new class { // Load sound and set up controls
	constructor() {this.setup()}
	async setup() {
		if (!await SoundMgr.setup()) {
			return void $('.volCtrl').hide()
		}
		Sound.vol = localStorage.anoPacVolume ?? 5
		$('#cvs_speaker')
			.on({click:this.mute})
			.on({wheel:this.onInput})
		$('.volRng')
			.prop({defaultValue:Sound.vol})
			.on({input:this.onInput})
		$on({keydown:this.onKeydown.bind(this)})
	}
	mute(/**@type {MouseEvent}*/e) {
		lstVol = Sound.vol || (lstVol || +volRng.max >> 1)
		$(volRng)
			.prop({value:(Sound.vol? 0 : lstVol)})
			.trigger('input')
	}
	onInput(/**@type {Event}*/e) {
		const isInputElem = e.target instanceof HTMLInputElement
		Sound.vol = (isInputElem? e.target : volRng).valueAsNumber
	}
	onKeydown(/**@type {KeyboardEvent}*/e) {
		if (keyRepeat(e) || isCombinationKey(e))
			return
		if (e.key.toUpperCase() == 'M'
		 || e.target == volRg2 && isEnterKey(e))
			this.mute()
	}
})
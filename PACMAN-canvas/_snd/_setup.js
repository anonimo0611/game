import {input}    from '../src/control.js'
import {Sound}    from './sound.js'
import {SoundMgr} from './loader.js'
import {Speaker}  from './speaker.js'

let  _lstVol = NaN
const volRng = input('volRng')
const volRg2 = input('volRg2')
const volume = +(localStorage.anopac_volume ?? 5)

const Ev = new class { // Register sound instances and set up controls
	constructor() {this.setup()}
	async setup() {
		await SoundMgr.load()
			? Ev.onLoaded()
			: Ev.onFailed()
	}
	onLoaded() {
		Speaker.draw(volume)
		$win.on({keydown:Ev.onKeydown})
		$('#speaker')
			.on({click:Ev.mute})
			.on({wheel:Ev.onInput})
		$('.volRng')
			.attr({value:volume})
			.attr({defaultValue:volume})
			.on({input:Ev.onInput})
	}
	onFailed() {
		$('.volCtrl').hide()
	}
	onInput(/**@type {Event}*/e) {
		const isInput = e.target instanceof HTMLInputElement
		Sound.vol = (isInput? e.target : volRng).valueAsNumber
		Speaker.draw(localStorage.anopac_volume = Sound.vol)
	}
	onKeydown(/**@type {JQuery.KeyDownEvent}*/e) {
		if (keyRepeat(e) || isCombiKey(e)) return
		if (e.key.toUpperCase() == 'M'
		 || e.target == volRg2 && isEnterKey(e)) Ev.mute()
	}
	mute() {
		_lstVol = Sound.vol || (_lstVol || +volRng.max >> 1)
		$(volRng).prop({value:Sound.vol? 0 : _lstVol}).trigger('input')
	}
}
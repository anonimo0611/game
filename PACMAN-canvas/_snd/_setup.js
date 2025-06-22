import {ctrl}     from '../src/control.js'
import {Sound}    from './sound.js'
import {SoundMgr} from './loader.js'

let  _lstVol = NaN
const volRng = ctrl('volRng')
const volRg2 = ctrl('volRg2')

;(new class { // Register sound instances and set up controls
	constructor() {this.setup()}
	async setup() {
		await SoundMgr.load()
			? this.onLoaded()
			: this.onFailed()
	}
	onLoaded() {
		Sound.vol = localStorage.anopac_volume ?? 5
		$win.on({keydown:e=> this.onKeydown(e)})
		$('#cvs_speaker')
			.on({click:this.mute})
			.on({wheel:this.onInput})
		$('.volRng')
			.prop({value:Sound.vol})
			.prop({defaultValue:Sound.vol})
			.on({input:this.onInput})
	}
	onFailed() {
		$('.volCtrl').hide()
	}
	onInput(/**@type {Event}*/e) {
		const isInput = e.target instanceof HTMLInputElement
		Sound.vol = (isInput? e.target : volRng).valueAsNumber
		localStorage.anopac_volume =  Sound.vol
	}
	onKeydown(/**@type {JQuery.KeyDownEvent}*/e) {
		if (keyRepeat(e) || isCombiKey(e))
			return
		if (e.key.toUpperCase() == 'M'
		 || e.target == volRg2 && isEnterKey(e))
			this.mute()
	}
	mute() {
		_lstVol = Sound.vol || (_lstVol || +volRng.max >> 1)
		$(volRng).prop({value:Sound.vol? 0 : _lstVol}).trigger('input')
	}
})
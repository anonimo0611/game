import {State}    from '../src/state.js'
import {GhsMgr}   from '../src/ghosts/_system.js'
import {Ids}      from './_manifest.js'
import {SoundMgr} from './loader.js'
import {Speaker}  from './speaker.js'

/** @typedef {import("./_manifest.js").SirenType} ST */

const [volRg2,volRng]= /**@type {HTMLInputElement[]}*/(byClass('volRng'))
const SirenIds = /**@type {ST[]}*/(Ids.filter(id=>id.startsWith('siren')))

export const Sound = new class extends SoundMgr {
	static {this.#init()}
	static async #init() {
		if (!await SoundMgr.setup())
			return $('.volCtrl').hide()
		Sound.vol = localStorage.anoPacVolume ?? 5
		$on({keydown:Sound.#onKeydown})
		$('.volRng') .prop({defaultValue:Sound.vol})
		$('.volRng') .on({input:Sound.#onWheel})
		$('#speaker').on({wheel:Sound.#onWheel}).on({click:Sound.#mute})
	}

	/** @type {?number} */
	#lstVol = null

	/** @param {MouseEvent} e */
	#onWheel(e) {
		Sound.vol = /**@type {HTMLInputElement}*/
			(e.type == 'input'? e.target:volRng).valueAsNumber
	}

	/** @param {KeyboardEvent} e */
	#onKeydown(e) {
		if (keyRepeat(e) || isCombinationKey(e)) return
		if (e.key.toUpperCase() == 'M'
		 || e.target == volRg2 && isEnterKey(e)) Sound.#mute()
	}

	#mute() {
		Sound.#lstVol = Sound.vol || (Sound.#lstVol ?? +volRng.max>>1)
		$(volRng).prop({value:Sound.vol? 0:Sound.#lstVol}).trigger('input')
	}
	get vol()      {return super.vol}
	get disabled() {return super.disabled || State.isAttract}
	get sirenId()  {return SirenIds[GhsMgr.Elroy.part]}
	get ringing()  {return Sound.isPlaying('bell')}
	set vol(vol) {
		if (Sound.disabled) return
		vol = isNaN(vol)? 10 : clamp(+vol, 0, 10)
		localStorage.anoPacVolume = volRng.valueAsNumber = super.vol = +vol
		Speaker.draw(Sound.vol)
	}
	playSiren() {
		if (!GhsMgr.isFright && !GhsMgr.hasEscape)
			Sound.stop('fright').stopSiren().play(Sound.sirenId)
	}
	playFright() {
		if (!GhsMgr.hasEscape)
			Sound.stopSiren().play('fright')
	}
	stopSiren() {
		return Sound.stop(...SirenIds)
	}
	stopLoops() {
		return Sound.stopSiren().stop('fright','escape')
	}
	/** @param {boolean} bool */
	toggleFrightMode(bool) {
		bool? Sound.playFright()
		    : Sound.playSiren()
	}
	ghostEscape() {
		Sound.stopSiren().stop('fright').play('escape')
	}
	ghostArrivedAtHome() {
		if (GhsMgr.hasEscape) return
		const id = GhsMgr.isFright? 'fright':Sound.sirenId
		Sound.stop('escape').play(id)
	}
};freeze(Sound)
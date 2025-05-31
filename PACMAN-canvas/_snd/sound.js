import {State}    from '../src/state.js'
import {ctrl}     from '../src/control.js'
import {GhsMgr}   from '../src/ghosts/_system.js'
import {SirenIds} from './_manifest.js'
import {SoundMgr} from './loader.js'
import {Speaker}  from './speaker.js'

const volRng = ctrl('volRng')
const volRg2 = ctrl('volRg2')

export const Sound = new class extends SoundMgr {
	static {this.#init()}
	static async #init() {
		if (!await SoundMgr.setup())
			return $('.volCtrl').hide()
		Sound.vol = localStorage.anoPacVolume ?? 5
		$on({keydown:Sound.#onKeydown})
		$('#speaker')
			.on({wheel:Sound.#onWheel})
			.on({click:Sound.#mute})
		$('.volRng')
			.prop({defaultValue:Sound.vol})
			.on({input:Sound.#onWheel})
	}

	/** @param {MouseEvent} e */
	#onWheel(e) {
		const isInputElem = e.target instanceof HTMLInputElement
		Sound.vol = (isInputElem? e.target : volRng).valueAsNumber
	}

	/** @param {KeyboardEvent} e */
	#onKeydown(e) {
		if (keyRepeat(e)
		 || isCombinationKey(e))
			return
		if (e.key.toUpperCase() == 'M'
		 || e.target == volRg2 && isEnterKey(e))
		 	Sound.#mute()
	}

	#lstVol = NaN
	#mute() {
		Sound.#lstVol = Sound.vol
			|| (Sound.#lstVol || +volRng.max >> 1)
		$(volRng)
			.prop({value:(Sound.vol? 0 : Sound.#lstVol)})
			.trigger('input')
	}

	get sirenId()  {return SirenIds[GhsMgr.Elroy.part]}
	get ringing()  {return Sound.isPlaying('bell')}
	get disabled() {return super.disabled || State.isAttract}

	get vol() {return super.vol}
	set vol(_vol) {
		if (!Sound.disabled) {
			const vol = super.vol = clamp(+_vol, 0, 10)
			Speaker.draw(localStorage.anoPacVolume=volRng.valueAsNumber=vol)
		}
	}
	playSiren() {
		if (!GhsMgr.isFright && !GhsMgr.hasEscape)
			Sound.stopLoops().play(Sound.sirenId)
	}
	playFright() {
		if (!GhsMgr.hasEscape)
			Sound.stopSiren().play('fright')
	}
	stopSiren = ()=> Sound.stop(...SirenIds)
	stopLoops = ()=> Sound.stopSiren().stop('fright','escape')

	/** @param {boolean} bool */
	toggleFrightMode(bool) {
		bool
			? Sound.playFright()
			: Sound.playSiren()
	}
	ghostEscape() {
		Sound.stopSiren().stop('fright').play('escape')
	}
	ghostArrivedAtHome() {
		if (!GhsMgr.hasEscape) {
			const id = GhsMgr.isFright? 'fright' : Sound.sirenId
			Sound.stop('escape').play(id)
		}
	}
}
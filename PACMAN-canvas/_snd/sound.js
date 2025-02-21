import {State}    from '../src/_state.js'
import {GhsMgr}   from '../src/ghosts/_system.js'
import {SoundMgr} from './loader.js'
import {Speaker}  from './speaker.js'

const speaker  = byId('speaker')
const volRng   = byId('volRng')
const volRg2   = byId('volRg2')
const volRngG  = dqsAll('.volRng')
const SirenIds = SoundMgr.ids.filter(id=> /^siren/.test(id))

const isEnterKey = e=> /^(\x20|Enter)$/.test(e.key)

export const Sound = new class extends SoundMgr {
	static {this.#init()}
	static async #init() {
		const result = await SoundMgr.setup().catch(()=> false)
		if (!result) return $('.volCtrl').hide()
		Sound.vol = localStorage.anoPacVolume ?? 10
		$on('keydown',Sound.#onKeydown)
		$(volRngG).prop({defaultValue:Sound.vol})
		$(volRngG).on('input',Sound.#onWheel)
		$(speaker).on('wheel',Sound.#onWheel).on('click',Sound.#mute)
	}
	/** @type {?number} */
	#lstVol = null
	#onWheel(e) {
		Sound.vol = (e.type=='input'? e.target:volRng).valueAsNumber
	}
	#onKeydown(e) {
		if (e.originalEvent.repeat || isCombinationKey(e)) return
		if (e.key.toUpperCase() == 'M'
		 || e.target == volRg2 && isEnterKey(e)) Sound.#mute()
	}
	#mute() {
		Sound.#lstVol = Sound.vol || (Sound.#lstVol ?? +volRng.max)
		$(volRng).prop({value:Sound.vol? 0:Sound.#lstVol}).trigger('input')
	}
	get vol()      {return super.vol}
	get disabled() {return super.disabled || State.isAttract}
	get sirenId()  {return SirenIds[GhsMgr.Elroy.part]}
	get ringing()  {return Sound.isPlaying('bell')}
	set vol(vol) {
		if (Sound.disabled) return
		vol = isNaN(vol)? 10 : clamp(+vol, 0, 10)
		localStorage.anoPacVolume = volRng.value = super.vol = vol
		Speaker.draw(Sound.vol)
	}
	playSiren() {
		if (!GhsMgr.frightened && !GhsMgr.hasEscape)
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
		const id = GhsMgr.frightened? 'fright':Sound.sirenId
		Sound.stop('escape').play(id)
	}
};freeze(Sound)
import {State}    from '../src/_state.js'
import {GhsMgr}   from '../src/ghosts/_system.js'
import {SoundMgr} from './loader.js'
import {Speaker}  from './speaker.js'

const volRng   = byId('volRng')
const speaker  = byId('speaker')
const SirenIds = SoundMgr.ids.filter(id=> /^siren/.test(id))

const isEnterKey = e=>
	!isCombinationKey(e) && /^(\x20|Enter)$/.test(e.key)

export const Sound = new class extends SoundMgr {
	static {this.#init()}
	static async #init() {
		const result = await SoundMgr.setup().catch(()=> false)
		if (!result) return $('.volCtrl').hide()
		$on('keydown',Sound.#onKeydown)
		Sound.vol = localStorage.anoPacVolume ?? 10
		Sound.#setup()
	}
	#lstVol = null
	#setup() {
		$(speaker)  .on('wheel',Sound.#onCtrl).on('click keyup',Sound.#mute)
		$('.volRng').on('input',Sound.#onCtrl).trigger('input')
		$('#volRng').prop({defaultValue:Sound.vol})
	}
	#onKeydown(e) {
		if (isCombinationKey(e)) return
		e.key.toUpperCase() == 'M' && Sound.#mute(e)
	}
	#onCtrl(e) {
		Sound.vol = (e.type=='input'? e.target:volRng).valueAsNumber
	}
	#mute(e) {
		if (e.type == 'keyup' && !isEnterKey(e)) return
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
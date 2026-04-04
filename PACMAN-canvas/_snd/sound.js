import {State}     from '../src/state.js'
import {GhostMgr}  from '../src/ghosts/_system.js'
import {SoundMgr}  from './manager.js'
import {onSettled} from './_setup.js'
import {SirenIds}  from './_manifest.js'
import {Manifest}  from './_manifest.js'

/**
 @extends {SoundMgr<T>}
 @typedef {import('./_manifest').SoundType} T
 @typedef {{[K in T as `play${K}`]:Sound.playFn}} Play
 @typedef {{[K in T as `stop${K}`]:()=> ISound}}  Stop
 @typedef {SoundCore & Play & Stop} ISound
*/
class SoundCore extends SoundMgr {
	constructor()  {super(Manifest, onSettled)}
	get sirenId()  {return SirenIds[GhostMgr.CruiseElroy.part]}
	get ringing()  {return this.isPlaying('GetsHiScore')}
	get disabled() {return super.disabled || State.isAttract}

	get vol() {
		return super.vol
	}
	set vol(vol) {
		if (this.disabled) return
		super.vol = clamp(+vol, 0, 10)
	}
	playSiren() {
		if (GhostMgr.isFrightMode
		 || GhostMgr.areAnyEscaping) return
		Sound.stopLoops().play(Sound.sirenId)
	}
	toggleFrightMode(/**@type {boolean}*/on) {
		on? Sound.#switchToFright()
		  : Sound.playSiren()
	}
	#switchToFright() {
		if (GhostMgr.areAnyEscaping) return
		Sound.stopSiren().playFrightMode()
	}
	switchToEyesEscaping() {
		Sound.stopSiren().stopFrightMode().playEyesEscaping()
	}
	onGhostReturned() {
		if (GhostMgr.areAnyEscaping) return
		Sound.stopEyesEscaping()
		GhostMgr.isFrightMode
			? Sound.playFrightMode()
			: Sound.play(Sound.sirenId)
	}
	stopSiren = ()=> Sound.stop(...SirenIds)
	stopLoops = ()=> Sound.stopSiren().stopFrightMode().stopEyesEscaping()
}
export const Sound = /**@type {ISound}*/(new SoundCore)
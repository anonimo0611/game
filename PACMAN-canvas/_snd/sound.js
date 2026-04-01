import {State}     from '../src/state.js'
import {onSettled} from './_setup.js'
import {SirenIds}  from './_manifest.js'
import {Manifest}  from './_manifest.js'
import {GhostMgr}  from '../src/ghosts/_system.js'
import {SoundMgr}  from './manager.js'

/**
 @extends {SoundMgr<T>}
 @typedef {import('./_manifest').SoundType} T
 @typedef {import('./_sound.d').Sound.Opts} opts
 @typedef {{[K in T as`play${K}`]:(opts?:opts)=> void}}   Play
 @typedef {{[K in T as`stop${K}`]:(...ids:T[])=> ISound}} Stop
 @typedef {SoundCore & Play & Stop} ISound
*/
class SoundCore extends SoundMgr {
	constructor()  {super(Manifest, onSettled)}
	get sirenId()  {return SirenIds[GhostMgr.CruiseElroy.part]}
	get ringing()  {return this.isPlaying('BellSE')}
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
		on? Sound.#playFrightened()
		  : Sound.playSiren()
	}
	#playFrightened() {
		if (GhostMgr.areAnyEscaping) return
		Sound.stopSiren().playFrightSE()
	}
	playEscapaingEyes() {
		Sound.stopSiren().stopFrightSE().playEyesSE()
	}
	onGhostReturned() {
		if (GhostMgr.areAnyEscaping) return
		Sound.stopEyesSE()
		GhostMgr.isFrightMode
			? Sound.playFrightSE()
			: Sound.play(Sound.sirenId)
	}
	stopSiren = ()=> Sound.stop(...SirenIds)
	stopLoops = ()=> Sound.stopSiren().stopFrightSE().stopEyesSE()
}
export const Sound = /**@type {ISound}*/(new SoundCore)
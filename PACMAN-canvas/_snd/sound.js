import {State}    from '../src/state.js'
import {GhsMgr}   from '../src/ghosts/_system.js'
import {Setup}    from './_setup.js'
import {SirenIds} from './_manifest.js'
import {Manifest} from './_manifest.js'
import {SoundMgr} from './manager.js'

/**
 @import  {SoundDef as Def} from './_sound.d.ts'
 @typedef {import('./_manifest.js').SoundType} T
 @extends {SoundMgr<T>}
 @typedef {{[K in T as`play${K}`]:(opts?:Def.Opts)=> void}} Play
 @typedef {{[K in T as`stop${K}`]:(...ids:T[])=> IState}} Stop
 @typedef {SoundCore & Play & Stop} IState
*/
class SoundCore extends SoundMgr {
	constructor()  {super(Setup, Manifest)}
	get sirenId()  {return SirenIds[GhsMgr.CruiseElroy.part]}
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
		if (GhsMgr.isFrightMode
		 || GhsMgr.areAnyEscaping) return
		Sound.stopLoops().play(Sound.sirenId)
	}
	toggleFrightMode(/**@type {boolean}*/on) {
		on? Sound.#playFrightened()
		  : Sound.playSiren()
	}
	#playFrightened() {
		if (GhsMgr.areAnyEscaping) return
		Sound.stopSiren().playFrightSE()
	}
	playEscapaingEyes() {
		Sound.stopSiren().stopFrightSE().playEyesSE()
	}
	onGhostReturned() {
		if (GhsMgr.areAnyEscaping) return
		Sound.stopEyesSE()
		GhsMgr.isFrightMode
			? Sound.playFrightSE()
			: Sound.play(Sound.sirenId)
	}
	stopSiren = ()=> Sound.stop(...SirenIds)
	stopLoops = ()=> Sound.stopSiren().stopFrightSE().stopEyesSE()
}
export const Sound = /**@type {IState}*/(new SoundCore)
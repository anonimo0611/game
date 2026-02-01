import {State}    from '../src/state.js'
import {GhsMgr}   from '../src/ghosts/_system.js'
import {Setup}    from './_setup.js'
import {SirenIds} from './_manifest.js'
import {SoundMgr} from './manager.js'
import {Manifest,OptsMap,Ids} from './_manifest.js'

/**
 @typedef {import('./_manifest.js').SoundType} SoundType
 @typedef {import('./manager.js').PlayOpts} PlayOpts
*/
/**
 @extends {SoundMgr<SoundType>}
 @typedef {{[K in SoundType as`play${Capitalize<K>}`]:(opts?:PlayOpts)=> void}} PlayMethods
 @typedef {{[K in SoundType as`stop${Capitalize<K>}`]:()=> ISound}} StopMethods
 @typedef {SoundCore & PlayMethods & StopMethods} ISound
*/
class SoundCore extends SoundMgr {
	constructor() {
		super(Setup,Manifest,Ids,OptsMap)
	}
	get sirenId()  {return SirenIds[GhsMgr.CruiseElroy.part]}
	get ringing()  {return this.isPlaying('bell')}
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
	playGhostEscaping() {
		Sound.stopSiren().stopFright().playEyesGhost()
	}
	toggleFrightMode(/**@type {boolean}*/on) {
		on? Sound.#onFrightMode()
		  : Sound.playSiren()
	}
	#onFrightMode() {
		if (GhsMgr.areAnyEscaping) return
		Sound.stopSiren().playFright()
	}
	onGhostReturned() {
		if (GhsMgr.areAnyEscaping) return
		Sound.stopEyesGhost()
		GhsMgr.isFrightMode
			? Sound.playFright()
			: Sound.play(Sound.sirenId)
	}
	stopSiren = ()=> Sound.stop(...SirenIds)
	stopLoops = ()=> Sound.stopSiren().stopFright().stopEyesGhost()
}
/** @type {ISound} */
export const Sound = /**@type {any}*/(new SoundCore)
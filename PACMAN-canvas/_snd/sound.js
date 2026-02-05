import {State}    from '../src/state.js'
import {GhsMgr}   from '../src/ghosts/_system.js'
import {Setup}    from './_setup.js'
import {SirenIds} from './_manifest.js'
import {Manifest} from './_manifest.js'
import SoundMgr   from './manager.js'

/**
 @typedef {import('./_manifest.js').SoundType} SoundType
 @extends {SoundMgr<SoundType,SoundCore>}
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
	playGhostEscaping() {
		Sound.stopSiren().stopFrightSE().playEyesSE()
	}
	toggleFrightMode(/**@type {boolean}*/on) {
		on? Sound.#onFrightMode()
		  : Sound.playSiren()
	}
	#onFrightMode() {
		if (GhsMgr.areAnyEscaping) return
		Sound.stopSiren().playFrightSE()
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
export const Sound = new SoundCore()
import {State}    from '../src/state.js'
import {GhsMgr}   from '../src/ghosts/_system.js'
import {Setup}    from './_setup.js'
import {SirenIds} from './_manifest.js'
import {SoundMgr} from './manager.js'
import {Manifest,OptsMap,Ids} from './_manifest.js'

/** @typedef {import('./_manifest.js').SoundType} SoundType */
/** @extends {SoundMgr<SoundType>} */
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
		if (!GhsMgr.isFrightMode && !GhsMgr.areAnyEscaping)
			Sound.stopLoops().play(Sound.sirenId)
	}
	playFright() {
		if (!GhsMgr.areAnyEscaping)
			Sound.stopSiren().play('fright')
	}
	stopSiren = ()=> this.stop(...SirenIds)
	stopLoops = ()=> this.stopSiren().stop('fright','escape')

	toggleFrightMode(/**@type {boolean}*/on) {
		on? this.playFright()
		  : this.playSiren()
	}
	ghostEscape() {
		this.stopSiren().stop('fright').play('escape')
	}
	ghostArrivedAtHome() {
		if (!GhsMgr.areAnyEscaping) {
			const id = GhsMgr.isFrightMode? 'fright' : this.sirenId
			this.stop('escape').play(id)
		}
	}
}
export const Sound = new SoundCore()
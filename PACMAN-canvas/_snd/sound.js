import './_setup.js'
import {State}    from '../src/state.js'
import {GhsMgr}   from '../src/ghosts/_system.js'
import {SirenIds} from './_manifest.js'
import {SoundMgr} from './loader.js'

export const Sound = new class extends SoundMgr {
	get sirenId()  {return SirenIds[GhsMgr.CruiseElroy.part]}
	get ringing()  {return Sound.isPlaying('bell')}
	get disabled() {return super.disabled || State.isAttract}

	get vol() {return super.vol}
	set vol(vol) {
		if (!Sound.disabled)
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
	stopSiren = ()=> Sound.stop(...SirenIds)
	stopLoops = ()=> Sound.stopSiren().stop('fright','escape')

	toggleFrightMode(/**@type {boolean}*/on) {
		on? Sound.playFright()
		  : Sound.playSiren()
	}
	ghostEscape() {
		Sound.stopSiren().stop('fright').play('escape')
	}
	ghostArrivedAtHome() {
		if (!GhsMgr.areAnyEscaping) {
			const id = GhsMgr.isFrightMode? 'fright' : Sound.sirenId
			Sound.stop('escape').play(id)
		}
	}
}
import './_setup.js'
import {State}    from '../src/state.js'
import {GhsMgr}   from '../src/ghosts/_system.js'
import {SirenIds} from './_manifest.js'
import {SoundMgr} from './loader.js'
import {Speaker}  from './speaker.js'

export const Sound = new class extends SoundMgr {
	get sirenId()  {return SirenIds[GhsMgr.Elroy.part]}
	get ringing()  {return Sound.isPlaying('bell')}
	get disabled() {return super.disabled || State.isAttract}

	get vol() {return super.vol}
	set vol(_vol) {
		if (!Sound.disabled) {
			const vol = super.vol = clamp(+_vol, 0, 10)
			Speaker.draw(vol)
			localStorage.anoPacVolume = vol
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

	toggleFrightMode(/**@type boolean*/b) {
		b? Sound.playFright()
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
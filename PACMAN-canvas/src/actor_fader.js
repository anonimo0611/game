import {State} from './state.js';
export class SpawnFader {
	constructor(dur=500, isFadeOut=false) {
		/** @private @type {Fade} */
		this.fader = Fade.set(dur,{isFadeOut})
	}
	set(dur=500, isFadeOut=false) {
		this.fader = Fade.set(dur,{isFadeOut})
	}
	alpha(max=1) {
		if (State.isDemoMode) return 1
		const {fader}= this
		return fader.isIn
			? State.isReady? fader.alpha:max
			: fader.alpha
	}
	update(max=1) {
		const {fader}= this
		if (!fader.running) return
		fader.isIn
			? State.isReady && fader.update(max)
			: fader.update(max)
	}
}
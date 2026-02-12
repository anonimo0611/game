import {State} from './state.js';
export class SpawnFader {
	constructor(dur=500, isFadeOut=false) {
		/** @private @type {Fade} */
		this.fader = Fade.set(dur,{isFadeOut})
	}
	alpha(max=1) {
		if (State.isDemoMode) return 1
		const  f = this.fader
		return f.isIn? (State.isReady? f.alpha:max) : f.alpha
	}
	update(max=1) {
		const f = this.fader; if (!f.running) return
		f.isIn? State.isReady && f.update(max) : f.update(max)
	}
}
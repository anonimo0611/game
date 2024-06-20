import {Loader}   from './_loader.js'
import {Instance} from './_loader.js'
import {Ticker}   from '../lib/timer.js'
import {Game}     from '../src/_main.js';

export const Sound = new class extends Loader {
	static {this.#setup()}
	static async #setup() {
		if (!await Loader.setup())
			return

		Sound.vol = +localStorage.ArkanoidVolume ?? 10
		Sound.#setCtrlEvents(Sound.vol);
		addEventListener('keydown', Sound.#onKeydown)
	}
	#setCtrlEvents(vol) {
		$('#volRng') .on('input', Sound.#onInput).attr({value:vol})
		$('#speaker').on('click', Sound.mute)
		$('#volCtrl').addClass('loaded')
	}
	#onKeydown(e) {
		!e.repeat && /^M$/i.test(e.key) && Sound.mute()
	}
	#onInput(e) {
		Sound.vol = e.target.valueAsNumber;
	}
	#lstVol = null;
	get vol() {return super.vol}
	set vol(vol) {
		if (Sound.failed)
			return

		vol = clamp(+vol, 0, 10);
		$('#speaker').css('--w', (v=> {
			if (v == 0) return 0;
			if (between(v, 8, 10)) return 3;
			if (between(v, 4,  7)) return 2;
			if (between(v, 1,  3)) return 1;
		})(vol))
		localStorage.ArkanoidVolume = super.vol = vol
	}
	play(id, cfg={}) {
		if (!Sound.failed && !Game.isDemoScene)
			Instance.get(id)?.play(Sound.configMerge(id, cfg))
	}
	stop(...ids) {
		if (Sound.failed)
			return this

		ids.length == 0 && super.stop()
		ids.forEach(id=> Instance.get(id)?.stop())
		return this
	}
	pause(id) {
		!arguments.length
			? Instance.forEach(i=> i.paused=true)
			: Instance.get(id)?.setPaused(true)
	}
	resume(id) {
		!arguments.length
			? Instance.forEach(i=> i.paused=false)
			: Instance.get(id)?.setPaused(false)
	}
	pauseAll(bool) {
		bool? Sound.pause()
		    : Sound.resume()
	}
	mute() {
		Sound.#lstVol = Sound.vol || (Sound.#lstVol ?? 10)
		Sound.vol = Sound.vol? 0 : Sound.#lstVol
	}
};
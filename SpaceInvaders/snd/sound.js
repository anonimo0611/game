import {Loader}   from './_loader.js'
import {Instance} from './_loader.js'
import {Scene}    from '../src/scene.js';
import {Ticker}   from '../lib/timer.js'

const Ctrl = byId('volCtrl');

export const Sound = new class extends Loader {
	static {this.#setup()}
	static async #setup() {
		const result = await Loader.setup().catch(e=> false);
		if (!result) {return};
		Sound.#restore()
		$on('keydown', e=> {/^M$/i.test(e.key) && Sound.#mute(e)})
		$('#volRng') .on('input',Sound.#applyVol).eq(0).trigger('input')
		$('#speaker').on('click',Sound.#mute)
		$(Ctrl).addClass('loaded');
	}
	#lstVol = null;
	get vol() {return super.vol}
	set vol(vol) {
		if (Sound.failed) {return};
		$('#speaker').css('--w', (v=> {
			if (v == 0) return 0;
			if (between(v, 8, 10)) {return 3}
			if (between(v, 4,  7)) {return 2}
			if (between(v, 1,  3)) {return 1}
		})(vol))
		localStorage.SpaceInvadersVolume = super.vol = vol;
	}
	#restore() {
		volRng.value = localStorage.SpaceInvadersVolume ?? 10;
	}
	#applyVol(e) {
		Sound.vol = (e.type == 'input' ? e.target : volRng).valueAsNumber
	}
	#mute(e) {
		e.stopPropagation();
		Sound.#lstVol = Sound.vol || (Sound.#lstVol ?? +volRng.max)
		Sound.vol = Sound.vol ? 0 : Sound.#lstVol
	}
	play(id, cfg={}) {
		const instance = Instance.get(id);
		if (Sound.failed || !instance) {return};
		isNum(cfg.duration) && (instance._duration=cfg.duration);
		instance.play(this.configMerge(id, cfg));
	}
	stop(...ids) {
		if (Sound.failed) {return this}
		!ids.length && super.stop()
		ids.forEach(id=> Instance.get(id)?.stop())
		return this
	}
	pause(id) {
		!arguments.length
			? Instance.forEach(i=> i.paused=true)
			: Instance.get(id)?.setPaused(true)
	}
	resume(id) {
		if (Sound.failed || Ticker.paused) {return}
		!arguments.length
			? Instance.forEach(i=> i.paused=false)
			: Instance.get(id)?.setPaused(false)
	}
}; freeze(Sound)
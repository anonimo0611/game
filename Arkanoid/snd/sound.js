import Loader   from './_loader.js'
import {Scene}  from '../src/scene.js';
import {Ticker} from '../lib/timer.js'

const Instance = new Map();
const Ctrl = byId('volCtrl');

export const Sound = new class {
	static {
		$(window).one('SoundLoaded',this.setup)
	}
	static setup() {
		Loader.ids.forEach(id=> Instance.set(id, createjs.Sound.createInstance(id)))
		Sound.#restore()
		$on('keydown', e=> {/^M$/i.test(e.key) && Sound.#mute()})
		$('#volRng') .on('input',Sound.#applyVol).eq(0).trigger('input')
		$('#speaker').on('click',Sound.#mute)
		Ctrl.css('--width',`${Ctrl.width}px`).addClass('loaded')
	}
	#lstVol = null;
	get vol(){
		return createjs.Sound.volume * 10
	}
	get disabled(){
		return Loader.failed
	}
	#setVol(vol) {
		if (Sound.disabled) return;
		createjs.Sound.volume = vol / 10;
		$('#speaker').css('--w', (v=> {
			if (v == 0) return 0;
			if (between(v, 8, 10)) return 3;
			if (between(v, 4,  7)) return 2;
			if (between(v, 1,  3)) return 1;
		})(vol))
		localStorage.ArkanoidVolume = vol;
	}
	#restore() {
		volRng.value = localStorage.ArkanoidVolume ?? 10;
	}
	#applyVol(e) {
		Sound.#setVol((e.type == 'input' ? e.target : volRng).valueAsNumber)
	}
	#mute(e) {
		e.stopPropagation();
		Sound.#lstVol = Sound.vol || (Sound.#lstVol ?? +volRng.max)
		Sound.#setVol(Sound.vol ? 0 : Sound.#lstVol)
	}
	play(id, cfg={}) {
		if (Sound.disabled || !isStr(id)) return
		if (!Scene.some('Ready|InGame|Dropped|GameOver')) return
		cfg = Loader.configMerged(id, cfg)
		if (cfg.duration) Instance.get(id)?.setDuration(cfg.duration)
		Instance.has(id)? Instance.get(id).play(cfg) : createjs.Sound.play(id, cfg)
	}
	stop(...ids) {
		if (Sound.disabled) return this
		if (!ids.length) createjs.Sound.stop()
		ids.forEach(id=> {Instance.get(id)?.stop()})
		return this
	}
	pause(id) {
		if (!arguments.length) Instance.forEach(i=> i.paused = true)
		else Instance.has(id) && (Instance.get(id).paused = true)
	}
	resume(id) {
		if (Sound.disabled || Ticker.paused) return
		if (!arguments.length) Instance.forEach(i=> i.paused = false)
	}
}; freeze(Sound)
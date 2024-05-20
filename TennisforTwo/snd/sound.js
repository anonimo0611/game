import {Loader}   from './_loader.js'
import {Instance} from './_loader.js'
import * as Btns  from './buttons.js';
import {Button}   from '../src/buttons.js';
import {cvs,ctx}  from '../src/canvas.js';
import {Scene}    from '../src/scene.js';
import {Speaker}  from '../snd/speaker.js';

export const Sound = new class extends Loader {
	static {this.#setup()}
	static async #setup() {
		if (!await Loader.setup()) return;
		Sound.vol = localStorage.tennisForTwoVolume ?? 10;
		values(Btns).forEach(Button.set);
		addEventListener('keydown', Sound.#onKeydown);
	}
	#onKeydown(e) {
		if (e.repeat) return;
		/^M$/i.test(e.key) && Sound.mute();
	}
	#lstVol = null;
	get vol() {return super.vol}
	set vol(vol) {
		if (Sound.failed || !isNum(+vol)) return;
		vol = clamp(+vol, 0, 10);
		localStorage.tennisForTwoVolume = super.vol = vol;
	}
	volBy(num) {
		if (!isNum(num) || num === 0) return;
		const lstVol = Sound.vol;
		Sound.vol = clamp(Sound.vol+int(num), 0, 10);
		(lstVol != Sound.vol) && Sound.play('info');
	}
	play(id, cfg={}) {
		if (Sound.failed || Scene.isTitle && id != 'info') return;
		Instance.get(id)?.play(this.configMerge(id, cfg));
	}
	stop(...ids) {
		if (Sound.failed) return this;
		ids.length == 0 && super.stop();
		ids.forEach(id=> Instance.get(id)?.stop());
		return this;
	}
	pause(id) {
		!arguments.length
			? Instance.forEach(i=> i.paused=true)
			: Instance.get(id)?.setPaused(true);
	}
	resume(id) {
		!arguments.length
			? Instance.forEach(i=> i.paused=false)
			: Instance.get(id)?.setPaused(false);
	}
	pauseAll(bool) {
		bool? Sound.pause()
		    : Sound.resume();
	}
	mute() {
		Sound.#lstVol = Sound.vol || (Sound.#lstVol ?? 10);
		Sound.vol = Sound.vol? 0 : Sound.#lstVol;
	}
};
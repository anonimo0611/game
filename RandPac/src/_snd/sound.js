import {Loader}    from './_loader.js'
import {Instance}  from './_loader.js'
import {Speaker}   from './speaker.js';
import {Container} from '../_main.js';
import {Actor}     from '../actor.js';
import {Scene}     from '../scene.js'
import {Maze}      from '../maze.js'
import {Ghost}     from '../ghosts/ghost.js'

const volRng   = byId('volRng');
const speaker  = byId('speaker');
const SirenIds = integers(4).map(i=>`siren${i}`);
const isEnter  = e=> /^(\x20|Enter)$/.test(e.key);

export const Sound = new class extends Loader {
	static {this.#setup()}
	static async #setup() {
		const result = await Loader.setup().catch(e=> false);
		Sound.#setupCompleted = true;
		if (!result) $('#volume').hide();
		else {
			$on('Resize', Sound.#draw);
			Sound.vol = localStorage.randPacVolume ?? 10;
			Sound.#setupCtrls();
		}
	}
	#lstVol = null;
	#setupCompleted = false;

	get sirenId() {
		return SirenIds[Ghost.Elroy.part];
	}
	get setupCompleted() {
		return this.#setupCompleted;
	}
	get vol() {
		return super.vol;
	}
	set vol(vol) {
		if (Sound.failed) return;
		vol = isNaN(vol) ? 10 : clamp(+vol, 0, 10);
		localStorage.randPacVolume = volRng.value = super.vol = vol;
		Sound.#draw();
	}
	#applyVol(e) {
		Sound.vol = (e?.type == 'input' ? e?.target : volRng).valueAsNumber;
	}
	#mute(e) {
		if (isCombinationKey(e)) return;
		if (e.type == 'keyup' && !isEnter(e)) return;
		Sound.#lstVol = Sound.vol || (Sound.#lstVol ?? +volRng.max);
		Sound.vol = Sound.vol? 0 : Sound.#lstVol;
	}
	play(id, cfg={}) {
		const instance = Instance.get(id);
		if (Sound.failed || !instance) return;
		isNum(cfg.duration) && (instance._duration=cfg.duration);
		instance.play(this.configMerge(id, cfg));
	}
	stop(...ids) {
		if (Sound.failed) return this;
		!ids.length && super.stop();
		ids.forEach(id=> Instance.get(id)?.stop());
		return this
	}
	eat(idx) {
		const duration = [85,78,75][MAZE_IDX];
		Sound.play('eat'+idx, {duration});
	}
	siren() {
		if (!Scene.isPlaying || Ghost.frightened) return;
		!Ghost.hasEscape && Sound.stop('fright').stopSiren().play(this.sirenId);
	}
	fright() {
		!Ghost.hasEscape && Sound.stopSiren().play('fright');
	}
	stopSiren = ()=> Sound.stop(...SirenIds);
	stopLoops = ()=> Sound.stopSiren().stop('fright','escape');
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
	ghsEscape() {
		Sound.stopSiren().stop('fright').play('escape');
	}
	ghsArrivedAtHome() {
		if (Ghost.hasEscape || Actor.frozen) return;
		Sound.stop('escape').play(Ghost.frightened? 'fright' : this.sirenId);
	}
	#draw() {
		Speaker.draw(Sound.vol);
	}
	#setupCtrls() {
		const timer = {id: 0};
		$on('keydown', e=> {Sound.#onKeydown(e, timer)});
		volRng .on('keydown', e=> {isEnter(e) && Container.focus()});
		volRng .on('input',Sound.#applyVol).trigger('input');
		speaker.on('wheel',Sound.#applyVol).on('click keyup',Sound.#mute);
	}
	#onKeydown(e, timer) {
		if (isCombinationKey(e)) return;
		switch (e.key.toUpperCase()) {
		case 'M': return Sound.#mute(e);
		case '+':
		case '-':
			clearTimeout(timer.id)
			timer.id  = setTimeout(hideRng, 1000);
			Sound.vol = Sound.vol + Number(e.key+1);
			volRng.classList.add('show');
		}
		function hideRng() {
			volRng.classList.remove('show');
		}
	}
};
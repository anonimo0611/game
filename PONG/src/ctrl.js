import {Sound}  from '../snd/sound.js';
import {Ticker} from '../lib/timer.js';
import {Window} from './_window.js';
import {cvs}    from './_canvas.js';
import {Game}   from './_main.js';
import {Scene}  from './scene.js';
import {Score}  from './score.js';

export const Pointer = freeze(new class {
	constructor() {
		$on({
			touchmove: this.#onMove.bind(this),
			mousemove: this.#onMove.bind(this),
		});
		$(cvs).on({mousedown: this.#onMouseDown.bind(this)});
	}
	#y = 0;
	get isTouchDevice() {
		return 'ontouchstart' in window;
	}
	get y() {
		return this.#y;
	}
	#onMouseDown(e) {
		if (e.button > 0)
			return;
		if (Ticker.paused) {
			Ticker.pause(false);
		}
		if (Scene.isDemo) {
			Score.reset();
			Scene.switch(Scene.enum.InGame);
			Sound.play('se0');
		}		
	}
	#onMove(e) {
		e.preventDefault();
		e = e.touches?.[0] || e;
		const rect = cvs.getBoundingClientRect();
		this.#y = (e.clientY - rect.top) / Window.scale;
	}
});
const KeyCtrl = freeze(new class {
	constructor() {
		if (Pointer.isTouchDevice) return;
		$on('keydown', this.#onKeyDown.bind(this));
	}
	#onKeyDown(e) {
		if (e.key.toUpperCase() == 'R') {
			Ticker.pause(false);
			Sound.play('reset');
			Score.reset();
			Scene.switch(Scene.enum.Demo);
		}
		if (e.key == 'Escape' && Scene.isInGame) {
			Ticker.pause();
			Game.draw();
		}
	}
});
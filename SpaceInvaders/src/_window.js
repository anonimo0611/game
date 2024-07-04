import {Ticker}  from '../lib/timer.js';
import {Sound}   from '../snd/sound.js';
import {cvs,ctx} from './_canvas.js';
import {Game}    from './_main.js';
import {Scene}   from './scene.js';

let scale    = 1;
let resizeId = 0;

export const Window = freeze(new class {
	static {$load(this.#setup)}
	static #setup() {
		$on('resize',   Window.#onResize);
		$on('keydown',  Window.#onKeydown);
		$on('blur', e=> Window.#pause(e, true));
		$on('focus',e=> Window.#pause(e, false));
		document.body.dataset.state = 'loaded';
		Window.#fit();
	}
	FontSize = parseInt(ctx.font);
	get scale() {return scale}

	#pause(e, force) {
		if (Scene.isInGame) {
			if (e.type == 'focus') {return}
			Ticker.pause(force)
				? Sound.pause()
				: Sound.resume();
			Game.draw();
			return;
		}
		Ticker.pause(force);
	}
	#fit() {
		const w = $(window).width()  / cvs.offsetWidth;
		const h = $(window).height() / cvs.offsetHeight;
		scale = min(w, h);
		cvs.style.transform = `scale(${scale})`;
	}
	#onKeydown(e) {
		if (!Scene.isInGame) {return}
		e.key == 'Escape' && Window.#pause(e)
	}
	#onResize(e) {
		!Ticker.paused && Ticker.pause(true);
		clearTimeout(resizeId);
		resizeId = setTimeout(()=> Ticker.pause(false), 2e3);
		Window.#fit();
	}
});
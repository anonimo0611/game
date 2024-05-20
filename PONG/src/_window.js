import {Ticker}  from '../lib/timer.js';
import {cvs,ctx} from './_canvas.js';
import {Game}    from './_main.js';
import {Scene}   from './scene.js';

const dBoard = byId('canvas');
let scale    = 1;
let resizeId = 0;
let resizing = false;

export const Window = freeze(new class {
	static {
		$on('blur', e=> Window.#onBlur(e));
		$on('DOMContentLoaded resize', e=> Window.#onResize(e));
	}
	get board()    {return dBoard}
	get scale()    {return scale}
	get resizing() {return resizing}
	#fit() {
		const w = $(window).width()  / cvs.offsetWidth;
		const h = $(window).height() / cvs.offsetHeight;
		cvs.style.transform = `scale(${scale=min(w, h)*0.8})`;
	}
	#onBlur() {
		if (Scene.isDemo)
			return;
		Ticker.pause(true);
		Game.draw();
	}
	#onResize(e) {
		if (e.type != 'load') {
			clearTimeout(resizeId);
			resizing = true;
			resizeId = setTimeout(_=> resizing = false, 2000);
		}
		Window.#fit();
	}
});
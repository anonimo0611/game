import {cvs}    from './_canvas.js';
import {Window} from './_window.js';

export const Mouse = new class {
	static {
		$on({mousemove:e=> Mouse.#setPos(e)});
	}
	#x = 0;
	#setPos(e) {
		const rect = cvs.getBoundingClientRect();
		this.#x = (e.pageX - rect.left) / Window.scale;
	}
	get x() {return this.#x}
};
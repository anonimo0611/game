import {cvs}    from './_canvas.js';
import {Window} from './_window.js';

let x = 0;
export const Mouse = new class {
	static {
		$on({mousemove:e=> Mouse.#setPos(e)});
	}
	#setPos(e) {
		const rect = cvs.getBoundingClientRect();
		x = (e.pageX - rect.left) / Window.scale;
	}
	get x() {return x}
};
import {cvs} from './_canvas.js';

const dBoard   = byId('board');
const FontSize = document.body.fontSize();
const DialogY  = dBoard.height - (FontSize*12.5);
const ScaleMin = 0.6;
const ScaleMax = 1.0;

let scale    = 1;
let resizeId = 0;
let resizing = false;

export const Window = new class {
	static {
		$on({'DOMContentLoaded resize': e=> Window.#onResize(e)});
		$(dRoot).css({'min-height':`${dBoard.height*ScaleMin}px`});
	}
	get scale() {
		return clamp(scale, ScaleMin, ScaleMax);
	}
	get resizing() {
		return resizing;
	}
	get board() {
		return dBoard;
	}
	#fit() {
		const w = $(window).width()  / dBoard.offsetWidth;
		const h = $(window).height() / dBoard.offsetHeight;
		scale = min(w*.98, h);
		dBoard.style.transform = `scale(${this.scale})`;
	}
	#onResize(e) {
		if (e.type != 'DOMContentLoaded') {
			clearTimeout(resizeId);
			resizing = true;
			resizeId = setTimeout(_=> resizing = false, 2000);
		}
		Window.#fit();

		const boardTop = max((innerHeight-dBoard.height)/2, 0);
		$('body').css({
			'--scale': Window.scale,
			'--canvas-left': `${cvs.offsetLeft}px`,
			'--canvas-top':  `${cvs.offsetTop}px`,
			'--canvas-width':`${cvs.offsetWidth}px`,
			'--dialog-top':  `${cvs.offsetTop+boardTop+DialogY}px`,
		});
	}
};
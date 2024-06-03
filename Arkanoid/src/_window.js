import {cvs} from './_canvas.js';

const dBoard   = byId('board');
const ScaleMin = 0;
const ScaleMax = 2;
const FontSize = dBody.fontSize();

let scale    = 1;
let resizeId = 0;
let resizing = false;

export const Window = new class {
	static {$ready(this.#setup)}
	static #setup() {
		$on({resize:Window.#onResize}).trigger('resize');
		$(dRoot).css({'min-height':(dBoard.height*ScaleMin)+'px'});
	}
	Board = dBoard;
	get scale()    {return clamp(scale, ScaleMin, ScaleMax)}
	get resizing() {return resizing}
	#fit() {
		const w = $(window).width()  / dBoard.width;
		const h = $(window).height() / dBoard.height;
		scale = min(w*0.98, h*0.9);
		dBoard.style.transform = `scale(${this.scale})`;
	}
	#onResize(e) {
		if (e.type == 'resize') {
			clearTimeout(resizeId);
			resizing = true;
			resizeId = setTimeout(_=> resizing = false, 2000);
		}
		Window.#fit();
		Window.#setCSSVars();
	}
	#setCSSVars() {
		$(dBody).css({
			'--scale': Window.scale,
			'--board-top': `${($(window).height() - dBoard.height*scale)/2}px`,
		});
	}
};
freeze(Window);
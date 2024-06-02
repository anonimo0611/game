import {cvs} from './_canvas.js';

const dBoard   = byId('board');
const ScaleMin = 0.6;
const ScaleMax = 1.0;
const FontSize = dBody.fontSize();
const DialogY  = dBoard.height - (FontSize*12.5);

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
		const w = $(window).width()  / dBoard.offsetWidth;
		const h = $(window).height() / dBoard.offsetHeight;
		scale = min(w*.98, h);
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
		const BoardTop = max((innerHeight-dBoard.height)/2, 0);
		$(dBody).css({
			'--scale': Window.scale,
			'--canvas-left': `${cvs.offsetLeft}px`,
			'--canvas-top':  `${cvs.offsetTop}px`,
			'--canvas-width':`${cvs.offsetWidth}px`,
			'--dialog-top':  `${cvs.offsetTop+BoardTop+DialogY}px`,
		});
	}
};
freeze(Window);
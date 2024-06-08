import {Ticker} from '../lib/timer.js';
import {cvs}    from './_canvas.js';

const dBoard   = byId('board');
const FontSize = dBody.fontSize();

let $scale    = 1;
let $resizeId = 0;
let $resizing = false;

export const Window = new class {
	static {$ready(this.#setup)}
	static #setup() {
		Window.#fit();
		Window.#setCSSVars();
		$on({resize:Window.#onResize});
	}
	Board = dBoard;
	get scale()    {return $scale}
	get resizing() {return $resizing}
	#fit() {
		const w = $(window).width()  / dBoard.width;
		const h = $(window).height() / dBoard.height;
		$scale = min(w*0.98, h*0.9);
		dBoard.style.transform = `scale(${$scale})`;
	}
	#onResize(e) {
		if (e.type == 'resize') {
			!Ticker.paused && Ticker.pause(true);
			clearTimeout($resizeId);
			$resizeId = setTimeout(()=> Ticker.pause(false), 2e3);
		}
		Window.#fit();
		Window.#setCSSVars();
	}
	#setCSSVars() {
		const boardTop = ($(window).height() - dBoard.height*$scale)/2;
		$(dBody).css({
			'--scale': $scale,
			'--board-top': `${boardTop}px`,
		});
	}
};
freeze(Window);
import {Ticker} from '../lib/timer.js';
import {cvs}    from './_canvas.js';

const dBoard   = byId('board');
const FontSize = dBody.fontSize();

export const Window = new class {
	static {$load(this.#setup)}
	static #setup() {
		Window.#fit();
		Window.#setCSSVars();
		Window.#setResizeEvent();
		dBody.addClass('loaded');
	}
	Board  = dBoard;
	#scale = 1;
	get scale() {
		return this.#scale;
	}
	#fit() {
		const w = $(window).width()  / dBoard.width;
		const h = $(window).height() / dBoard.height;
		this.#scale = min(w*0.98, h*0.9);
		dBoard.style.transform = `scale(${this.scale})`;
	}
	#setResizeEvent() {
		let id = 0;
		$on('resize', ()=> {
			!Ticker.paused && Ticker.pause(true);
			clearTimeout(id);
			id = setTimeout(()=> Ticker.pause(false), 2e3);
			Window.#fit();
			Window.#setCSSVars();
		});
	}
	#setCSSVars() {
		const boardTop = ($(window).height() - dBoard.height*this.scale)/2;
		$(dBody).css({
			'--scale': this.scale,
			'--board-top': `${boardTop}px`,
		});
	}
};freeze(Window);
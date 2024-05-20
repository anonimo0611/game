import {cvs,ctx} from './_canvas.js';

const FontSize = 26;
ctx.font = `${FontSize}px Vector`;

const dBoard = byId('canvas');
let scale    = 1;
let resizeId = 0;
let resizing = false;

export const Window = freeze(new class {
	static {
		$on('load resize', e=> Window.#onResize(e));
	}
	FontSize = FontSize;
	get board()    {return dBoard}
	get scale()    {return scale}
	get resizing() {return resizing}
	#fit() {
		const w = $(window).width()  / cvs.offsetWidth;
		const h = $(window).height() / cvs.offsetHeight;
		scale = min(w*.90, h*.98);
		dBoard.style.transform = `scale(${scale})`;
	}
	#onResize(e) {
		if (e.type == 'load')
			document.body.dataset.state = 'loaded';
		else {
			clearTimeout(resizeId);
			resizing = true;
			resizeId = setTimeout(_=> resizing = false, 2000);
		}
		Window.#fit();
	}
});
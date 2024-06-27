import {cvs}    from './_canvas.js';
import {Game}   from './_main.js';
import {Window} from './_window.js';

let mouseX = 0;
$on('mousemove', e=> {
	const rect = cvs.getBoundingClientRect();
	mouseX = (e.pageX - rect.left) / Window.scale;
});

export const Mouse = freeze(new class {
	get x() {return mouseX}
	acceptEvent(e) {
		if (Game.isDemoScene && !isNum(e?.button))
			return true;
		if (!Mouse.isMainButton(e))
			return false;
		return(e.target == cvs
			|| e.target == document.body
			|| e.target == Window.Board);
	}
	isMainButton   = e => e?.button === 0;
	isMiddleButton = e => e?.button === 1;
	isSubButton    = e => e?.button === 2;
});
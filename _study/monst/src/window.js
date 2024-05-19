import {cvs}     from './canvas.js';
import {Pointer} from './pointer.js';

export let scale = 1;
function resize(e) { // Fit to the viewport
	const w = $(window).width()  / cvs.offsetWidth;
	const h = $(window).height() / cvs.offsetHeight;
	let s = min(min(w, h*.8), 1);
 	if (Pointer.isTouchDevice) {
	 	const angle = abs(window.orientation);
		s = min(w, h * (angle ? .7 : 1));
	}
	cvs.style.transform = `scale(${scale = s})`;
}
$ready(()=> $on({resize}).trigger('resize'));
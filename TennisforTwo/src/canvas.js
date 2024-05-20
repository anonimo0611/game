import {Ticker} from '../lib/timer.js';
export const {cvs,ctx}= canvas2D('canvas');
export let $scale = 1;

let $resizeEndTimerId = 0;
function resize(e) { // Fit to the viewport
	if (e.type == 'resize') {
		!Ticker.paused && Ticker.pause(true);
		clearTimeout($resizeEndTimerId);
		$resizeEndTimerId = setTimeout(()=> Ticker.pause(false), 2e3);
	}
	const w = $(window).width()  / cvs.offsetWidth;
	const h = $(window).height() / cvs.offsetHeight;
	cvs.style.transform = `scale(${$scale = min(w, h)/1.5})`;
}
$on({resize,DOMContentLoaded:resize});
export const cvs = document.getElementById('canvas');
export const ctx = cvs.getContext('2d');

export let scale = 1;
function resize(e) { // Fit to the viewport
	const w = $(window).width()  / cvs.offsetWidth;
	const h = $(window).height() / cvs.offsetHeight;
	const s = min(min(w, h*0.9), 1);
	cvs.style.transform = `scale(${scale = s})`;
}
$on({resize}).trigger('resize');
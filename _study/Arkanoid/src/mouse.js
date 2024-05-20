import {cvs}    from './_canvas.js';
import {Window} from './_window.js';

let x = 0;
export const Mouse = {
	get x() {return x}
}
function setPos(e) {
	const rect = cvs.getBoundingClientRect();
	x = round((e.clientX - rect.left) / Window.scale);
}
$on('mousemove', setPos);
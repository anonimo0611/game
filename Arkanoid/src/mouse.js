import {cvs}    from './_canvas.js';
import {Window} from './_window.js';

export let MouseX = 0;

const setMouseX = e=> {
	const rect = cvs.getBoundingClientRect();
	MouseX = (e.pageX - rect.left) / Window.scale;
};
$on('mousemove', setMouseX);
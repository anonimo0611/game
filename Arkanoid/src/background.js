import {rgba}  from '../lib/color.js';
import {cvs}   from './_canvas.js';
import {Game}  from './_main.js';
import {Field} from './field.js';

const BgColors = deepFreeze([
	[0x51,0x51,0xFF], // Blue
	[0x51,0xFF,0x51], // Green
	[0xFF,0x51,0xFF], // Red
]);
const FrameImg = $('<img src="./res/frame.png">')[0];
const BgImages = integers(3).map(i=> $(`<img src="./res/bg${i}.png">`)[0]);

class BackgroundMgr {
	FrameImg = FrameImg;
	#Color = BgColors[0];
	get Color() {return this.#Color}
	init() {
		const idx = Game.stageIdx % BgImages.length;
		this.#Color = BgColors[idx];
		$(dBody).css({
			'--dialog-color': rgba(...this.Color, 0.4),
			'--bg-url': `url(${BgImages[idx].src})`,
		});
	}
} export const BgMgr = freeze(new BackgroundMgr);
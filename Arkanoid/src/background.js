import {rgba}  from '../lib/color.js';
import {cvs}   from './_canvas.js';
import {Game}  from './_main.js';
import {Field} from './field.js';

const ImageMax = 3;
const BgImages = Array(ImageMax);
const BgColorList = deepFreeze([
	[0x51,0x51,0xFF], // Blue
	[0x51,0xFF,0x51], // Green
	[0xFF,0x51,0xFF], // Red
]);

for (const i of BgImages.keys())
	BgImages[i] = $(`<img src="./res/bg${i}.png">`).get(0);

class Background {
	#Color = BgColorList[0];
	get Color() {
		return this.#Color;
	}
	init() {
		const idx = Game.stageIdx % ImageMax;
		this.#Color = BgColorList[idx];
		$(dBody).css({
			'--dialog-color': rgba(...this.Color, 0.4),
			'--bg-url': `url(${BgImages[idx].src})`
		});
	}
} export const Bg = new Background;
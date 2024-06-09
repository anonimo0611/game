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
export let BgRGB = BgColorList[0];

for (const i of BgImages.keys())
	BgImages[i] = $(`<img src="./res/bg${i}.png">`).get(0);

function setBgImage() {
	const idx = Game.stageIdx % ImageMax;
	BgRGB = BgColorList[idx];
	$(dBody).css({
		'--dialog-color': rgba(...BgRGB, 0.4),
		'--bg-url': `url(${BgImages[idx].src})`
	});
}
$on({'Init Ready':setBgImage});
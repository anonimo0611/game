import {rgba}  from '../lib/color.js';
import {cvs}   from './_canvas.js';
import {Game}  from './_main.js';
import {Field} from './field.js';

const ImageMax = 3;
const BgImages = Array(ImageMax);
const FrameImg = $('<img src="./res/frame.png">').get(0);

for (const i of BgImages.keys())
	BgImages[i] = $(`<img src="./res/bg${i}.png">`).get(0);

const ScoreRGBList = [
	[0x51,0x51,0xFF], // Blue
	[0x51,0xFF,0x51], // Green
	[0xFF,0x51,0xFF], // Red
];
export let scoreRGB = ScoreRGBList[0];

function setBgImage() {
	const idx = Game.stageIdx % ImageMax;
	const bg1 =`no-repeat 0 0/100% 100% url(${FrameImg.src}),`;
	const bg2 =`#999 0 0/80px 80px url(${BgImages[idx].src})`;
	scoreRGB = ScoreRGBList[idx];
	cvs.style.background = bg1+bg2;
	$(dBody).css({'--dialog-color':rgba(...scoreRGB, 0.4)});
}
$on({'Init Ready':setBgImage});
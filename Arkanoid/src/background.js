import {rgba} from '../lib/color.js';
import {cvs}  from './_canvas.js';
import {Game} from './_main.js';

const ImageMax = 3;
const FrameImg =
	$('<img src="./res/frame.png">').get(0);
const BgImages = integers(ImageMax).map(i=>
	$(`<img src="./res/bg${i}.jpg">`).get(0)
);
const ScoreRGBList = [
	[0x51,0x51,0xFF], // Blue
	[0x51,0xFF,0x51], // Green
	[0xFF,0x51,0xFF], // Red
];
export let scoreRGB = ScoreRGBList[0];

function setBgImage() {
	const idx = Game.stageIdx % ImageMax;
	const bg1 =`no-repeat 0 0/100% 100% url(${FrameImg.src}),`;
	const bg2 =`#999 url(${BgImages[idx].src})`;
	scoreRGB = ScoreRGBList[idx];
	$('body').css({'--dialog-color':rgba(...scoreRGB, 0.4)});
	cvs.style.background = bg1+bg2;
}
$on({'Init Ready':setBgImage});
import {rgba} from '../lib/color.js';
import {cvs}  from './_canvas.js';
import {Game} from './_main.js';

const BgMax = 3;

const
	FrameImg = new Image();
	FrameImg.src = `./res/frame.png`;

const BgImages = integers(BgMax).map(i=> {
	const
		BgImg = new Image();
		BgImg.src = `./res/bg${i}.jpg`;
	return BgImg;
});
const ScoreRGBList = [
	[0x51,0x51,0xFF], // Blue
	[0x51,0xFF,0x51], // Green
	[0xFF,0x51,0xFF], // Red
];

export let scoreRGB = ScoreRGBList[0];
function setBgImage() {
	const idx = Game.stageIdx % BgMax;
	const bg1 = `no-repeat 0 0/100% 100% url(${FrameImg.src}),`;
	const bg2 = `#999 url(${BgImages[idx].src})`;
	scoreRGB = ScoreRGBList[idx];
	document.body.css('--dialog-color', rgba(...scoreRGB,.4));
	cvs.style.background = bg1+bg2;
}
$on('Init Ready', setBgImage);
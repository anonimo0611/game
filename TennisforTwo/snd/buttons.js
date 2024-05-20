import {cvs,ctx} from '../src/canvas.js';
import {Court}   from '../src/court.js';
import {Button}  from '../src/buttons.js';
import {Sound}   from './sound.js';
import {Speaker} from './speaker.js'

const {FontSize}= Button;
const Padding = 0.15;
const BtnSize = FontSize * 0.8;
const MarginR = FontSize + FontSize*0.4;
const MarginB = FontSize + FontSize*0.3;

export class SpeakerBtn extends Button {
	constructor() {
		super({
			text:     null,
			elmId:   'speakerBtn',
			func:     Sound.mute,
			border:   Court.LineWidth/3,
			padding:  Padding,
			fontSize: FontSize,
			right:    MarginR,
			bottom:   MarginB,
		});
		cvs.addEventListener('wheel', e=> {
			if (!this.hover) return;
			0 < e.deltaY
				? Button.get(VolDownBtn)?.func()
				: Button.get(VolUpBtn)?.func();
		});
		this.disabled = false;
	}
	draw() {
		const lineWidth = Court.LineWidth*1.2;
		const {fontSize,color,padding}= this;
		ctx.save();
		ctx.translate(...this.Pos.vals);
		Speaker.draw(Sound.vol, fontSize, {lineWidth,color,padding});
		this.focused && this.drawBorder();
		ctx.restore();
	}
}
export class VolUpBtn extends Button {
	constructor() {
		super({
			text:    '+',
			elmId:   'volAddBtn',
			func:()=> Sound.volBy(+2),
			padding:  Padding,
			fontSize: BtnSize,
			right:    MarginR + BtnSize * (1+Padding),
			bottom:   BtnSize*1.5,
		});
	}
	draw() {
		this.disabled = Sound.vol == 10;
		super.draw();
	}
}
export class VolDownBtn extends Button {
	constructor() {
		super({
			text:    '-',
			elmId:   'volSubBtn',
			func:()=> Sound.volBy(-2),
			padding:  Padding,
			fontSize: BtnSize,
			right:    MarginR + BtnSize * (1+Padding) * 2.1,
			bottom:   BtnSize*1.5,
		});
	}
	draw() {
		this.disabled = Sound.vol == 0;
		super.draw();
	}
}
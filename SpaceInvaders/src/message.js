import {Ticker}  from '../lib/timer.js';
import {cvs,ctx} from './_canvas.js';
import {Window}  from './_window.js';
import {Scene}   from './scene.js';

const TopY    = Window.FontSize * 4;
const BottomY = cvs.height - (Window.FontSize*2);

class TypeOutGameOver {
	Text = 'GAME　OVER';
	#textPos = 0;
	constructor() {
		const textWidth = ctx.measureText(this.Text).width;
		this.Pos = vec2((cvs.width-textWidth)/2, TopY);
	}
	update() {
		if (Ticker.count % 8 != 0) {return}
		this.#textPos = min(this.#textPos+1, this.Text.length);
	}
	get drawValues() {
		const text = this.Text.substr(0, this.#textPos);
		return ['#F03', text, {align:'left', ...this.Pos}];
	}
}
export const Message = freeze(new class {
	static {$load(this.#setup)}
	static #setup() {
		$on('Title',    ()=> Message.#typeOutGameOver = null);
		$on('GameOver', ()=> Message.#typeOutGameOver = new TypeOutGameOver);
	}
	#typeOutGameOver = null;
	#drawText(color, text, {align='center', x=cvs.width/2, y=cvs.height/2}={}) {
		ctx.save();
		ctx.translate(x, y);
		ctx.textAlign = align;
		ctx.fillStyle = color;
		ctx.fillText(text, 0,0);
		ctx.restore();
	}
	update() {
		this.#typeOutGameOver?.update();
	}
	draw() {
		const SP = '\u2002';
		Ticker.paused && this.#drawText('#F03','PAUSED', {y:TopY});
		switch (Scene.current) {
		case Scene.Enum.Title:
			this.#drawText('#FC6',`PRESS${SP}SPACE${SP}TO${SP}START`, {y:BottomY});
			break;
		case Scene.Enum.Intro:
			this.#drawText('#6F6',`PLAY${SP}PLAYER<1>`);	
			break;
		case Scene.Enum.GameOver:
			this.#drawText(...this.#typeOutGameOver.drawValues);	
			break;
		}
	}
});
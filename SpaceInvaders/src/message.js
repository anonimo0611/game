import {Ticker}  from '../lib/timer.js';
import {cvs,ctx} from './_canvas.js';
import {Window}  from './_window.js';
import {Scene}   from './scene.js';

const [SP,FontSize]  = ['\u2002', Window.FontSize];
const TopMessageY    = {y:FontSize * 4.25};
const BottomMessageY = {y:cvs.height - FontSize*2};

class TypeOutGameOver {
	#pos = 0;
	Text = 'GAME　OVER';
	constructor() {freeze(this)}
	update() {
		if (Ticker.count % 8 != 0) {return}
		if (this.#pos <= this.Text.length) {
			this.#pos++;
		}
	}
	draw() {
		ctx.save();
		const width  = ctx.measureText(this.Text).width;
		const string = this.Text.substr(0, this.#pos);
		Message.drawText('#F03', string,
			{align:'left', x:(cvs.width-width)/2, ...TopMessageY});
		ctx.restore();
	}
}
export const Message = freeze(new class {
	#typeOutGameOver = null;
	drawText(color, text, {align='center', x=cvs.width/2, y=cvs.height/2}={}) {
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
		Ticker.paused && this.drawText('#F03','PAUSED', TopMessageY);
		switch (Scene.current) {
		case Scene.Enum.Title:
			this.#typeOutGameOver = null;
			this.drawText('#FC6',`PRESS${SP}SPACE${SP}TO${SP}START`, BottomMessageY);
			break;
		case Scene.Enum.Intro:
			this.drawText('#6F6',`PLAY${SP}PLAYER<1>`);	
			break;
		case Scene.Enum.GameOver:
			(this.#typeOutGameOver ||= new TypeOutGameOver).draw();
			break;
		}
	}
});
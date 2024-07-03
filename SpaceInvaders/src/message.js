import {Ticker}  from '../lib/timer.js';
import {cvs,ctx} from './_canvas.js';
import {Window}  from './_window.js';
import {Scene}   from './scene.js';

const SP = '\u2002';
const FontSize = Window.FontSize;
const TopMessageY = FontSize * 4.25;

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
		const string = this.Text.substr(0,this.#pos);
		Message.drawText('#F03', string,
			{align:'left', x:(cvs.width-width)/2, y:TopMessageY});
		ctx.restore();
	}
} let typeOutGameOver = null;

export const Message = freeze(new class {
	drawText(color='#FFF', text,
		{align='center', x=cvs.width/2, y=cvs.height/2}={})
	{
		ctx.save();
		ctx.translate(x, y);
		ctx.textAlign = align;
		ctx.fillStyle = color;
		ctx.fillText(text, 0,0);
		ctx.restore();
	}
	update() {
		typeOutGameOver?.update();
	}
	draw() {
		if (Ticker.paused) {
			this.drawText('#FF0033','PAUSED', {y:TopMessageY});
		}
		switch (Scene.current) {
		case Scene.Enum.Title:
			typeOutGameOver = null;
			this.drawText('#F1C273',`PRESS${SP}SPACE${SP}TO${SP}START`,
				{y:cvs.height - FontSize*2});
			break;
		case Scene.Enum.Intro:
			this.drawText('#66FF66',`PLAY${SP}PLAYER<1>`);	
			break;
		case Scene.Enum.GameOver:
			(typeOutGameOver ||= new TypeOutGameOver()).draw();
			break;
		}
	}
});
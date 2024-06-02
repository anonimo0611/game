import {Ticker}  from '../lib/timer.js';
import {Confirm} from '../lib/confirm.js';
import {rgba}    from '../lib/color.js';
import {cvs,ctx} from './_canvas.js';
import {Game}    from './_main.js';
import {Scene}   from './scene.js';
import {Field}   from './field.js';

const FontSize  = 28;
const ColorMain = '#EA6AAC'; // Pink
const ColorSub  = '#DCC678'; // Orange

export const Message = freeze(new class  {
	#draw(txt, color='#FFF',
		{
			rows=1, align='center', fs=FontSize,
			x=(cvs.width /2),
			y=(cvs.height/2)+(fs*4)+(fs*rows),
		}={}
	) {
		ctx.save();
		ctx.font = `${fs}px Atari`;
		ctx.textAlign     = align;
		ctx.fillStyle     = color;
		ctx.shadowColor   = rgba(0,0,0, 0.7);
		ctx.shadowOffsetX = 3;
		ctx.shadowOffsetY = 3;
		ctx.fillText(txt, x, y);
		ctx.restore();
	}
	#drawCtrls() {
		const [fs,m1,m2]= [18, 'Press M to mute','Press ESC to pause'];
		ctx.save();
		ctx.translate(Field.Left+fs/2, Field.Bottom-fs/2);
		this.#draw(m1, '#FFF', {fs, align:'left', x:0, y:-fs*1.2})
		this.#draw(m2, '#FFF', {fs, align:'left', x:0, y:0});
		ctx.restore();
	}
	draw() {
		if (Confirm.opened)
			return;

		switch (Scene.current) {
		case Scene.Enum.Clear:
			this.#draw(`STAGE ${Game.stageNum}`, ColorMain)
			this.#draw('CLEARED!', ColorSub, {rows:2.5});
			break;
		case Scene.Enum.GameOver:
			this.#draw('GAME　OVER', ColorMain);
			break;
		case Scene.Enum.Reset:
		case Scene.Enum.InDemo:
			this.#draw('GAME　OVER', ColorMain);
			this.#draw('Click to Start!', ColorSub, {rows:2.5})
			this.#drawCtrls();
			break;
		case Scene.Enum.Ready:
			if (Game.respawned)
				this.#draw('READY!', ColorSub, {rows:1.5});
			else {
				this.#draw(`STAGE ${Game.stageNum}`, ColorMain)
				if (Ticker.elapsed > Game.ReadyTime - 1000)
					this.#draw('READY!', ColorSub, {rows:2.5});
			}
			break;
		}
	}
});
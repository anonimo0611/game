import {Ticker}  from '../lib/timer.js';
import {Confirm} from '../lib/confirm.js';
import {rgba}    from '../lib/color.js';
import {cvs,ctx} from './_canvas.js';
import {Game}    from './_main.js';
import {Scene}   from './scene.js';
import {Field}   from './field.js';

const FontSize  = 28;
const MainColor = '#EA6AAC'; // Pink
const SubColor  = '#DCC678'; // Light Orange

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
		ctx.fillStyle     = color;
		ctx.textAlign     = align;
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
		if (Scene.isClear) {
			this.#draw(`STAGE ${Game.stageNum}`, MainColor)
			this.#draw('CLEARED!', SubColor, {rows:2.5});
			return;
		}
		if (Game.isDemoScene || Scene.isGameOver) {
			this.#draw('GAME　OVER', MainColor);
		}
		if (Game.isDemoScene) {
			this.#draw('Click to Start!', SubColor, {rows:2.5})
			this.#drawCtrls();
		}
		if (Scene.isReady) {
			if (Game.respawned) {
				this.#draw('READY!', SubColor, {rows:1.5});
				return;
			}
			this.#draw(`STAGE ${Game.stageNum}`, MainColor)
			if (Ticker.elapsed > Game.ReadyTime - 1000)
				this.#draw('READY!', SubColor, {rows:2.5});
		}
	}
});
import {Ticker}  from '../lib/timer.js';
import {Confirm} from '../lib/confirm.js';
import {rgba}    from '../lib/color.js';
import {cvs,ctx} from './_canvas.js';
import {Game}    from './_main.js';
import {Scene}   from './scene.js';
import {Field}   from './field.js';
import {Paddle}  from './paddle.js';
import {BallMgr} from './ball.js';

const FontSize = Field.RowHeight * 1.2;

const Color = freeze({
	Main:   '#EA6AAC', // Pink
	Sub:    '#DCC678', // Orange
	Shadow: '#222222',
});

export const Message = freeze(new class  {
	#draw(txt, color='#FFF', {
		offsetRow = 1,
		align     = 'center',
		fontSize  = FontSize,
		x = (cvs.width /2),
		y = (cvs.height/2)+(fontSize*4)+(fontSize*offsetRow),
	}={}) {
		ctx.save();
		ctx.font          = `${fontSize}px Atari`;
		ctx.textAlign     = align;
		ctx.fillStyle     = color;
		ctx.shadowColor   = Color.Shadow;
		ctx.shadowBlur    = fontSize * 0.2;
		ctx.shadowOffsetX = fontSize * 0.1;
		ctx.shadowOffsetY = fontSize * 0.1;
		ctx.fillText(txt, x, y);
		ctx.restore();
	}
	#drawCtrls() {
		const fontSize = FontSize/1.8;
		const [m1,m2]  = ['Press M to mute','Press ESC to pause'];
		ctx.save();
		ctx.translate(Field.Left+fontSize/2, Field.Bottom-fontSize/2);
		this.#draw(m1, '#FFF', {fontSize, align:'left', x:0, y:-fontSize*1.2})
		this.#draw(m2, '#FFF', {fontSize, align:'left', x:0, y:0});
		ctx.restore();
	}
	draw() {
		if (Confirm.opened) {
			return;
		}
		switch (Scene.current) {
		case Scene.Enum.Clear:
			this.#draw(`STAGE ${Game.stageNum}`, Color.Main)
			this.#draw('CLEARED!', Color.Sub, {offsetRow:2.5});
			break;

		case Scene.Enum.GameOver:
			this.#draw('GAME　OVER', Color.Main);
			break;

		case Scene.Enum.Reset:
		case Scene.Enum.InDemo:
			this.#draw('GAME　OVER', Color.Main);
			this.#draw('Click to Start!', Color.Sub, {offsetRow:2.5})
			this.#drawCtrls();
			break;

		case Scene.Enum.Ready:
			if (Game.respawned) {
				this.#draw('READY!', Color.Sub, {offsetRow:1.5});
			} else {
				this.#draw(`STAGE ${Game.stageNum}`, Color.Main)
				if (Ticker.elapsed > Game.ReadyTime * 0.4)
					this.#draw('READY!', Color.Sub, {offsetRow:2.5});
			}
			break;

		case Scene.Enum.InGame:
			if (Paddle.alpha < 1 || BallMgr.Ball.launched) {
				return;
			}
			this.#draw('Click to Launch!', Color.Sub, {offsetRow:1.5});
			break;
		}
	}
});
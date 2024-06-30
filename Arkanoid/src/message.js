import {Vec2}    from '../lib/vec2.js';
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
	#draw(offsetRow, color, text, {
		align    = 'center',
		fontSize = FontSize,
		x = (cvs.width /2),
		y = (cvs.height/2)+(fontSize*4)+(fontSize*offsetRow),
	}={}) {
		ctx.save();
		ctx.font          =`${fontSize}px Atari`;
		ctx.textAlign     = align;
		ctx.fillStyle     = color;
		ctx.shadowColor   = Color.Shadow;
		ctx.shadowBlur    = fontSize * 0.2;
		ctx.shadowOffsetX = fontSize * 0.1;
		ctx.shadowOffsetY = fontSize * 0.1;
		ctx.fillText(text, x, y);
		ctx.restore();
	}
	#drawCtrls() {
		const fS = FontSize/1.8;
		const [txt1,txt2]= ['Press M to mute','Press ESC to pause'];
		const [pos1,pos2]= [Vec2(0, -fS*1.2),Vec2(0, 0)]; 
		ctx.save();
		ctx.translate(Field.Left+fS/2, Field.Bottom-fS/2);
		this.#draw(0, '#FFF', txt1, {fontSize:fS, align:'left', ...pos1});
		this.#draw(0, '#FFF', txt2, {fontSize:fS, align:'left', ...pos2});
		ctx.restore();
	}
	draw() {
		if (Confirm.opened) {
			return;
		}
		switch (Scene.current) {
		case Scene.Enum.Clear:
			this.#draw(1.0, Color.Main, `STAGE ${Game.stageNum}`);
			this.#draw(2.5, Color.Sub,  'CLEARED!');
			return;

		case Scene.Enum.GameOver:
			this.#draw(1.0, Color.Main, 'GAME　OVER');
			return;

		case Scene.Enum.Reset:
		case Scene.Enum.InDemo:
			this.#draw(1.0, Color.Main, 'GAME　OVER');
			this.#draw(2.5, Color.Sub,  'Click to Start!');
			this.#drawCtrls();
			return;

		case Scene.Enum.Ready:
			this.#draw(1.0, Color.Main, `STAGE ${Game.stageNum}`);
			(Ticker.elapsed > Game.ReadyTime*0.4)
				&& this.#draw(2.5, Color.Sub, 'READY!');
			return;

		case Scene.Enum.InGame:
			(Paddle.alpha == 1 && !BallMgr.Ball.launched)
				&& this.#draw(1.5, Color.Sub, 'Click to Launch!');
			return;
		}
	}
});
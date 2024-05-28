import {rgba}        from '../lib/color.js';
import {Ticker}      from '../lib/timer.js';
import {Sound}       from '../snd/sound.js';
import {cvs,ctx}     from './_canvas.js';
import {DefaultRGBA} from './_canvas.js';
import {Scene}       from './scene.js';
import {Ball}        from './ball.js';
import {PlayerSide}  from './player.js';

const NormalColor = DefaultRGBA.string;
const GotPtsColor = rgba(227,101,203,DefaultRGBA.alpha);
const Colors = Array(NormalColor, NormalColor);

export const Score = freeze(new class {
	Max = 11;
	Pts = new Int8Array(PlayerSide.Max);
	reset() {
		Score.Pts.fill(0);
		Colors.fill(NormalColor);
	}
	update() {
		if (Ball.Pos.x < -Ball.Radius*3
		 || Ball.Pos.x >= cvs.width + Ball.Radius*3) {
			const idx = int(Ball.isLeftSide);
			this.Pts[idx]++;
			Ticker.Timer.set(700, _=> Colors[idx] = NormalColor);
			Colors[idx] = GotPtsColor;
			Sound.play('se4');
			Ball.respawn();
		}
		this.Pts.find(p=> p >= Score.Max)
			&& Scene.switchToDemo();
	}
	draw() {
		for (let i=0; i<PlayerSide.Max; i++) {
			const fs1 = 30;
			const fs2 = 80;
			const x   = cvs.width * (!i ? .25 : .75);
			const pts = String(this.Pts[i]).padStart(2, 0);
			ctx.save();
			ctx.textAlign = 'center';
			ctx.fillStyle = Colors[i];
			{   // Label
				ctx.save();
				ctx.translate(x, fs1 + fs1 * .2);
				ctx.font = `${fs1}px Vector`;
				ctx.fillText(!i ? 'YOU' : 'COM', 0,0);
				ctx.restore();
			}
			{   // Score
				ctx.save();
				ctx.translate(x, fs1*2 + fs1*1.5);
				ctx.font = `${fs2}px Vector`;
				ctx.fillText(pts, 0,0);
				ctx.restore();
			}
			ctx.restore();
		}
	}
});
import {rgba}     from '../lib/color.js';
import {Ticker}   from '../lib/timer.js';
import {cvs,ctx}  from './_canvas.js';
import {scoreRGB} from './background.js';
import {Scene}    from './scene.js';

const FontSize = 25;

let $score   = 0;
let $high    = 0;
let $disp1UP = 1;

export const Score = freeze(new class {
	static {$ready(this.#setup)}
	static #setup() {
		$on({Start:   Score.#onStart});
		$on({GameOver:Score.#onGameOver});
		$high = int(localStorage.arkanoidHiscore || 0);
	}
	Height   = FontSize+1;
	FontSize = FontSize;
	#onStart() {
		$score = 0;
	}
	#onGameOver() {
		const high = localStorage.arkanoidHiscore || 0;
		if ($high > high)
			localStorage.arkanoidHiscore = $high;
	}
	update() {
		$disp1UP ^= Ticker.count % 30 == 0;
	}
	get isShow1UP() {
		return !Scene.isInGame || (Scene.isInGame && $disp1UP);
	}
	add(pts=0) {
		if (!Scene.isInGame)
			return;
		$score += pts;
		$high = max($score, $high);
	}
	draw() {
		const y = FontSize+1;
		const ScoreStr =   `　${$score || '00'}`;
		const HighStr  = `HI　${$high  || '00'}`;

		// Backgound color
		ctx.save();
		ctx.fillStyle = rgba(...scoreRGB,.2);
		ctx.fillRect(0,0, cvs.width, FontSize+6);
		ctx.restore();

		// Draw score texts
		ctx.save();
		ctx.font = `${FontSize}px/1 Atari`;
		ctx.shadowColor   = rgba(0,0,0, 0.5);
		ctx.shadowOffsetX = 3;
		ctx.shadowOffsetY = 3;
		ctx.fillStyle = 'white';
		this.isShow1UP && ctx.fillText('1UP', FontSize, y);
		ctx.fillText(ScoreStr, FontSize* 4, y);
		ctx.fillText(HighStr,  FontSize*12, y);
		ctx.restore();
	}
});
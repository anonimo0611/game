import {rgba}    from '../lib/color.js';
import {Ticker}  from '../lib/timer.js';
import {cvs,ctx} from './_canvas.js';
import {BgMgr}   from './background.js';
import {Scene}   from './scene.js';
import {Field}   from './field.js';

const FontSize = Field.RowHeight;
const TextPosY = FontSize * 1.125;

let $score   = 0;
let $high    = 0;
let $disp1UP = 1;

export const Score = freeze(new class {
	static {$ready(this.#setup)}
	static #setup() {
		$on({
			Start:    Score.#onStart,
			GameOver: Score.#onGameOver,
		});
		$high = int(localStorage.arkanoidHiscore || 0);
	}
	#onStart() {
		$score = 0;
	}
	#onGameOver() {
		const high = localStorage.arkanoidHiscore || 0;
		if ($high > high)
			localStorage.arkanoidHiscore = $high;
	}
	add(pts=0) {
		if (!Scene.isInGame)
			return;
		$score += pts;
		$high = max($score, $high);
	}
	display1UP() {
		$disp1UP ^= Ticker.count % 30 == 0;
		if (!Scene.isInGame || (Scene.isInGame && $disp1UP))
			ctx.fillText('1UP', FontSize, TextPosY);
	}
	draw() {
		const ScoreStr =   `　${$score || '00'}`;
		const HighStr  = `HI　${$high  || '00'}`;

		// Backgound color
		ctx.save();
		ctx.fillStyle = rgba(...BgMgr.Color, 0.2);
		ctx.fillRect(0,0, cvs.width, FontSize * 1.5);
		ctx.restore();

		// Draw score texts
		ctx.save();
		ctx.font = `${FontSize}px Atari`;
		ctx.shadowColor   = rgba(0,0,0, 0.5);
		ctx.shadowOffsetX = FontSize * 0.1;
		ctx.shadowOffsetY = FontSize * 0.1;
		ctx.fillStyle = 'white';
		this.display1UP();
		ctx.fillText(ScoreStr, FontSize *  4, TextPosY);
		ctx.fillText(HighStr,  FontSize * 13, TextPosY);
		ctx.restore();
	}
});
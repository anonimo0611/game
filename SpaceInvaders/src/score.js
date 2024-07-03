import {rgba}     from '../lib/color.js';
import {Ticker}   from '../lib/timer.js';
import {Window}   from './_window.js';
import {cvs,ctx}  from './_canvas.js';
import {Scene}    from './scene.js';

const SP = '\u2002';
const ExtendPts = 1500;
const ScoreMax  = 1e5 - 1;

export const Score = freeze(new class {
	static {
		$on('load', ()=> Score.#setup());
	}
	#setup() {
		Score.#high = int(localStorage.spaceInvaderHiscore || 0);
		$on('Start',   Score.#onStart);
		$on('GameOver',Score.#onGameOver);
	}
	#score = 0;
	#high  = 0;
	Top    = Window.FontSize * .5;
	Bottom = (this.Top+Window.FontSize) * 1.5;
	#onStart() {
		Score.#score = 0;
	}
	#onGameOver() {
		const high = localStorage.spaceInvaderHiscore || 0;
		if (Score.#high > high) {
			localStorage.spaceInvaderHiscore = Score.#high;
		}
	}
	add(pts=0) {
		if (!Scene.isInGame) {return}
		pts += Score.#score;
		
		if (between(ExtendPts, Score.#score+1, pts)) {
			$trigger('Extend');
		}
		if (pts > Score.#high) {
			Score.#high = pts;
		}
		Score.#score = min(pts, ScoreMax);
	}
	get #zeroPadScore() {
		return !(Scene.isIntro && int(Ticker.count/5) % 2 != 0)
			? String(this.#score).padStart(5, 0) : '';
	}
	get #zeroPadHiScore() {
		return String(this.#high).padStart(5, 0);
	}
	draw() {
		const y = this.Top + Window.FontSize;
		const label1 = {text:`SOCRE<1>${SP}`, x:Window.FontSize};
		const label2 = {text:`HI-SOCRE${SP}`, x:cvs.width/2};

		ctx.save();

		ctx.fillStyle = '#68E0FC';
		ctx.fillText(label1.text, label1.x, y);
		ctx.fillText(label2.text, label2.x, y);

		ctx.fillStyle = 'white';
		const label1Width = ctx.measureText(label1.text).width;
		const label2Width = ctx.measureText(label2.text).width;
		ctx.fillText(`${this.#zeroPadScore}`,   label1.x + label1Width, y);
		ctx.fillText(`${this.#zeroPadHiScore}`, label2.x + label2Width, y);

		ctx.restore();
	}
});
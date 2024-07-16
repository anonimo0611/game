import {rgba}     from '../lib/color.js';
import {Ticker}   from '../lib/timer.js';
import {Window}   from './_window.js';
import {cvs,ctx}  from './_canvas.js';
import {Scene}    from './scene.js';

const SP = '\u2002';
const ScoreMax  = 1e5 - 1;
const ExtendPts = 1500;

let $score = 0;
let $high  = 0;

export const Score = freeze(new class {
	static {$load(()=> Score.#setup())}
	#setup() {
		$high = int(localStorage.spaceInvaderHiscore || 0);
		$on('Start',   Score.#onStart);
		$on('GameOver',Score.#onGameOver);
	}
	Top    = Window.FontSize * 0.5;
	Bottom = (this.Top+Window.FontSize) * 1.5;
	#onStart() {
		$score = 0;
	}
	#onGameOver() {
		const high = localStorage.spaceInvaderHiscore || 0;
		$high > high && (localStorage.spaceInvaderHiscore = $high);
	}
	add(pts=0) {
		if (!Scene.isInGame) {return}
		pts += $score;
		between(ExtendPts, $score+1, pts) && $trigger('Extend');
		$score = min(pts, ScoreMax);
		$high  = max($score, $high);
	}
	get #zeroPadScore() {
		return Scene.isIntro && int(Ticker.count/5) % 2 != 0
			? '' : String($score).padStart(5, 0);
	}
	get #zeroPadHiScore() {
		return String($high).padStart(5, 0);
	}
	draw() {
		const y = this.Top + Window.FontSize;
		const label1  = {text:`SOCRE<1>${SP}`, x:Window.FontSize};
		const label2  = {text:`HI-SOCRE${SP}`, x:cvs.width/2};
		const label1W = ctx.measureText(label1.text).width;
		const label2W = ctx.measureText(label2.text).width;

		ctx.save();
		ctx.fillStyle = '#7ED';
		ctx.fillText(label1.text, label1.x, y);
		ctx.fillText(label2.text, label2.x, y);
		ctx.fillStyle = '#FFF';
		ctx.fillText(`${this.#zeroPadScore}`,   label1.x+label1W, y);
		ctx.fillText(`${this.#zeroPadHiScore}`, label2.x+label2W, y);
		ctx.restore();
	}
});
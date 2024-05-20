import {rgba}     from '../lib/color.js';
import {Ticker}   from '../lib/timer.js';
import {cvs,ctx}  from './_canvas.js';
import {scoreRGB} from './background.js';
import {Scene}    from './scene.js';

export const Score = freeze(new class {
	static {
		$on('load', _=> Score.#setup());
	}
	#setup() {
		Score.#high = int(localStorage.arkanoidHiscore || 0);
		$on('Start',   Score.#onStart);
		$on('GameOver',Score.#onGameOver);
	}
	#score   =  0;
	#high    =  0;
	#disp1UP =  1;
	FontSize = 25;
	Height   = this.FontSize+1
	#onStart() {
		Score.#score = 0;
	}
	#onGameOver() {
		const high = localStorage.arkanoidHiscore || 0;
		if (Score.#high > high)
			localStorage.arkanoidHiscore = Score.#high;
	}
	add(pts=0) {
		if (!Scene.isInGame)
			return;

		pts += Score.#score;
		Score.#score = pts;
		if (pts > Score.#high)
			Score.#high = pts;
	}
	update() {
		if (Ticker.count % 30 == 0) this.#disp1UP = 1;
		if (Ticker.count % 60 == 0) this.#disp1UP = 0;
	}
	draw() {
		const fs = Score.FontSize, y = fs+1;
		// Backgound color
		ctx.save();
			ctx.fillStyle = rgba(...scoreRGB,.2);
			ctx.fillRect(0,0,cvs.width,fs+6);
		ctx.restore();

		// Draw score texts
		ctx.save();
		ctx.font = `${fs}px/1 Atari`;
		ctx.shadowColor   = rgba(0,0,0,.5);
		ctx.shadowOffsetX = 3;
		ctx.shadowOffsetY = 3;
		ctx.fillStyle = 'white';
		if (!Scene.isInGame || Scene.isInGame && this.#disp1UP)
			ctx.fillText('1UP', fs, y);
		ctx.fillText(`\u3000${this.#score  || '00'}`, fs*4, y);
		ctx.fillText(`HI\u3000${this.#high || '00'}`, (cvs.width/2), y);
		ctx.restore();
	}
});
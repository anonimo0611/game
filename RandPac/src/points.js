import {Timer} from './_lib/timer.js';
import {Ctx}   from './_main.js';
import {Score} from './score.js';
import {Color} from './maze.js';
import {Ghost} from './ghosts/ghost.js';

export const Points = new class {
	set({name,centerPos}={}, fn) {
		const {score} = Ghost, duration = 1200;
		const fadeOut = new FadeOut(200, duration-300);
		Score.add(score);
		PtsMap.set(name, {...centerPos,score,fadeOut});
		Timer.freeze().set(duration, _=> {
			Timer.unfreeze();
			PtsMap.delete(name);
			isFun(fn) && fn();
		});
	}
	#draw({x,y,score,fadeOut}) {
		Ctx.save();
		fadeOut?.update(Ctx);
		Ctx.font = `${T}px Digit`;
		const w = Ctx.measureText(score).width;
		Ctx.translate(clamp(x-w/2, 0, CVS_SIZE-w), y+T/3);
		Ctx.lineWidth   = T/8;
		Ctx.fillStyle   = Color.Score;
		Ctx.strokeStyle = Color.Dark;
		Ctx.strokeText(score, 0,0);
		Ctx.fillText(score, 0,0);
		Ctx.restore();
	}
	draw() {
		PtsMap.forEach(this.#draw);
	}
};
const PtsMap = new Map();
$on('Title Clear Losing', _=> PtsMap.clear());
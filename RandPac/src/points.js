import {Timer} from './_lib/timer.js';
import {Ctx}   from './_main.js';
import {Score} from './score.js';
import {Color} from './maze.js';
import {Ghost} from './ghosts/ghost.js';

export const Points = new class {
	set({name,centerPos}={}, fn) {
		const {points}= Ghost, duration = 1200;
		const fadeOut = new FadeOut(200, duration-300);
		Score.add(points);
		PtsMap.set(name, {...centerPos,points,fadeOut});
		Timer.freeze().set(duration, _=> {
			Timer.unfreeze();
			PtsMap.delete(name);
			isFun(fn) && fn();
		});
	}
	#drawPts({x,y,points:pts,fadeOut}) {
		Ctx.save();
		Ctx.font = `${T}px Digit`;
		fadeOut?.update(Ctx);
		const w = Ctx.measureText(pts).width;
		Ctx.translate(clamp(x-w/2, 0, CVS_SIZE-w), y+T/3);
		Ctx.lineWidth   = T/8;
		Ctx.fillStyle   = Color.Pts;
		Ctx.strokeStyle = Color.Dark;
		Ctx.strokeText(pts, 0, 0);
		Ctx.fillText(pts, 0, 0);
		Ctx.restore();
	}
	draw() {PtsMap.forEach(this.#drawPts)}
};
const PtsMap = new Map();
$on('Title Clear Losing', _=> PtsMap.clear());
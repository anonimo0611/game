import {Ticker}     from '../lib/timer.js';
import {Sound}      from '../snd/sound.js';
import {cvs,ctx}    from './_canvas.js';
import {Scene}      from './scene.js';
import {Score}      from './score.js';
import {InvaderMgr} from './invader.js';
import * as Sprite  from './invader_sprite.js';
import {Explosion2} from './explosion.js';

const UfoSet   = new Set();
const Interval = 60*20;

export const UfoMgr = new class {
	#counter = 0;
	static {
		$load(()=> UfoMgr.#setup());
	}
	#setup() {
		$on('Respawn', UfoMgr.#onRespawn);
		$on('Title Clear', UfoMgr.#reset);
	}
	#reset() {
		UfoMgr.#counter = 0;
		UfoSet.clear();
	}
	#onRespawn() {
		UfoSet.clear();
	}
	get currentInstance() {
		return UfoSet.values().next().value;
	}
	update() {
		if (!Scene.isInGame) {return}
		if (InvaderMgr.Map.size > 7 && UfoSet.size == 0
			&& UfoMgr.#counter++ >= Interval
		) {
			UfoMgr.#counter = 0;
			UfoSet.add(new Ufo);
			Sound.play('ufo_high');
		}
		UfoMgr.currentInstance?.update();
	}
	draw() {
		UfoMgr.currentInstance?.draw();
	}
};
export class Ufo {
	Type   = Sprite.InvaderType.Ufo;
	Width  = InvaderMgr.Size * 1.2;
	Height = InvaderMgr.Size * 1.2 * .45;
	Color  = '#FF0033';
	Pos    = vec2(0, Score.Bottom);
	Points = randChoice([50,100,150,300]);

	#velocityX   = cvs.width / (60*3);
	#destroyed   = false;
	#explCounter = 0;
	ExplDuration = 2034; // ms
	ExplFrames   = this.ExplDuration / Ticker.Interval;

	constructor() {
		this.Pos.x = randChoice([-this.Width, cvs.width+this.Width]);
		if (this.Pos.x > cvs.width/2) {
			this.#velocityX *= -1;
		}
		freeze(this);
	}
	get destroyed() {
		return this.#destroyed;
	}
	update() {
		if (!Scene.isInGame) {return}
		if (!this.destroyed) {
			this.Pos.x += this.#velocityX;
			if (this.#velocityX < 0 && this.Pos.x < -this.Width
			 || this.#velocityX > 0 && this.Pos.x > cvs.width+this.Width) {
				UfoSet.clear();
				Sound.stop('ufo_high');
			}
		} else if (this.#explCounter++ >= this.ExplFrames) {
			UfoSet.clear();
		}
	}
	destroy() {
		if (this.destroyed) {return}
		new Explosion2(this, {duration:this.ExplDuration/2});
		Score.add(this.Points);
		Sound.stop('ufo_high').play('ufo_low');
		this.#destroyed = true;
	}
	draw() {
		const {Pos,Type,Color,Width,Height}= this;
		ctx.save();
		ctx.translate(...Pos.asInt.vals);
		if (!this.destroyed) {
			Sprite.draw(ctx, Type);
		}
		if (this.#explCounter >= this.ExplFrames/2) {
			ctx.save();
			ctx.textAlign = 'center';
			ctx.fillStyle = Color;
			ctx.fillText(this.Points, Width/2,Height);
			ctx.restore();
		}
		ctx.restore();
	}
}
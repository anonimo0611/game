import {Ticker}   from '../lib/timer.js';
import {Sound}    from '../snd/sound.js';
import {cvs,ctx}  from './_canvas.js';
import {Game}     from './_main.js';
import {Scene}    from './scene.js';
import {Paddle}   from './paddle.js';
import {Army}     from './army.js';
import {BrickG}   from './brick.js';
import {Collider} from './brick.js';

const Color   = '#CCFF66';
const Rapid   = 2; // Up to 2 shots in field
const Speed   = cvs.height /  70 |0;
const RadiusX = cvs.width  / 157 |0;
const RadiusY = cvs.width  /  45 |0;

const L = 0;
const R = 1;
const Lasers = freeze([new Set(),new Set()]);
const BurstSet = new Set();

export class Laser extends Collider {
	static {$on({mousedown:Laser.#fire})}
	static #fire(e) {
		if (!Scene.isInDemo && !Game.acceptEventInGame(e))
			return;
		if (!Paddle.Launched || Paddle.CatchEnabeld)
			return;
		if (!Paddle.LaserEnabeld)
			return;

		if (Lasers[L].size < Rapid
		 || Lasers[R].size < Rapid) {
			Lasers[L].add(new Laser(L));
			Lasers[R].add(new Laser(R));
			Sound.stop('shot').play('shot');
		}
	}
	static update() {
		if (Scene.isInDemo && Ticker.count % 15 == 0)
			BrickG.canBeDestroyedByLasers && Laser.#fire();
		if (!Game.isPlayScene)
			return;
		Lasers[L].forEach(l=> l.update());
		Lasers[R].forEach(l=> l.update());
		Burst.update();
	}
	static draw() {
		if (!Game.isPlayScene)
			return;
		Lasers[L].forEach(l=> l.draw());
		Lasers[R].forEach(l=> l.draw());
		Burst.draw();
	}
	Width  = RadiusX * 2;
	Height = RadiusY * 2;
	constructor(side) {
		const offset = BrickG.ColWidth / 2;
		const y = Paddle.Pos.y - RadiusY;
		super(side == L
			? vec2(Paddle.CenterX-offset, y)
			: vec2(Paddle.CenterX+offset, y),
			RadiusX
		);
		this.side = side;
	}
	update() {
		this.Pos.y -= Speed;
		this.#collisionWithArmy();
		this.#collisionWithBrickOrFeild();
	}
	#collisionWithArmy() {
		const army = Army.detectCollided(this);
		if (army) {
			army.destroy();
			Lasers[this.side].delete(this);
		}
	}
	#collisionWithBrickOrFeild() {
		const object = this.hitT;
		if (object) {
			object.collision();
			Lasers[this.side].delete(this);
			Burst.set(this.Pos);
		}
	}
	draw() {
		ctx.save();
		ctx.translate(...this.Pos.vals);
		ctx.beginPath();
			ctx.fillStyle = Color;
			ctx.ellipse(0,0, RadiusX,RadiusY, 0,0, PI*2);
		ctx.fill();
		ctx.restore();
	}
}
class Burst {
	static set({x, y}) {
		const v = vec2(x, y);
		for (let i=90-150/2; i<=90+150/2; i+=30) {
			const cx = cos(i*PI/180);
			const cy = sin(i*PI/180);
			const cv = vec2(cx,cy);
			BurstSet.add(new Burst(x, y, cv));
		}
	}
	static update() {
		BurstSet.forEach(p=> p.update());
	}
	static draw() {
		BurstSet.forEach(p=> p.draw());
	}
	constructor(x, y, v) {
		this.Pos = vec2(x, y);
		this.r   = RadiusX;
		this.v   = v.mul(RadiusX / 2);
		this.cnt = 0;
	}
	update() {
		this.cnt++;
		if (this.cnt >= 8)
			BurstSet.delete(this);
		this.Pos.add(this.v);
	}
	draw() {
		ctx.save();
		ctx.translate(...this.Pos.vals);
		ctx.beginPath();
			ctx.lineWidth   = RadiusX;
			ctx.strokeStyle = Color;
			ctx.moveTo(0,0);
			ctx.lineTo(...vec2(this.v).mul(6).vals);
		ctx.stroke();
		ctx.restore();
	}
}
$on('Reset Ready Clear EndDemo Dropped Respawn', _=> {
	Lasers.forEach(s=> s.clear());
	BurstSet.clear();
});
import {Sound}     from '../snd/sound.js';
import {cvs,ctx}   from './_canvas.js';
import {Game}      from './_main.js';
import {Scene}     from './scene.js';
import {Field}     from './field.js';
import {Paddle}    from './paddle.js';
import {Army}      from './army.js';
import {BrickG}    from './brick.js';

const Color   = '#CCFF66';
const Rapid   =  2; // Up to 2 shots in field
const Speed   = 10;
const RadiusX =  4;
const RadiusY = 14;

const L = 0;
const R = 1;
const Lasers = freeze([new Set(),new Set()]);

export class Laser extends BrickG.Collider {
	static {
		$on('mousedown', Laser.#fire);
	}
	static #fire(e) {
		if (!Game.acceptEventInGame(e))
			return;
		if (!Paddle.launched || Paddle.catchEnabeld)
			return;
		if (!Paddle.laserEnabeld)
			return;

		if (Lasers[L].size < Rapid
		 || Lasers[R].size < Rapid) {
			Lasers[L].add(new Laser(L));
			Lasers[R].add(new Laser(R));
			Sound.stop('shot').play('shot');
		}
	}
	static update() {
		if (!Scene.isInGame)
			return;
		Lasers[L].forEach(l=> l.update())
		Lasers[R].forEach(l=> l.update())
		Burst.update();
	}
	static draw() {
		if (!Scene.isInGame)
			return;
		Lasers[L].forEach(l=> l.draw())
		Lasers[R].forEach(l=> l.draw())
		Burst.draw();
	}
	Width  = RadiusX * 2;
	Height = RadiusY * 2;
	constructor(side) {
		const offset = BrickG.ColWidth / 2;
		const y = Paddle.Pos.y - RadiusY;
		super(side == L
			? vec2(Paddle.centerX-offset, y)
			: vec2(Paddle.centerX+offset, y),
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
				ctx.ellipse(0,0, RadiusX,RadiusY, 0,0, PI*2);
				ctx.fillStyle = Color;
			ctx.fill();
		ctx.restore();
	}
}
const BurstSet = new Set();
class Burst {
	static set({x, y}) {
		const v = vec2(x, y);
		for (let i=0; i<180; i+=10) {
			const cx = cos(i*PI/180) + randFloat(-2.00,2.00);
			const cy = sin(i*PI/180) + randFloat(-0.25,2.00);
			const cv = vec2(cx,cy);
			BurstSet.add(new Burst(x, y, randInt(1,6), cv))
		}
	}
	static update() {
		BurstSet.forEach(p=> p.update());
	}
	static draw() {
		BurstSet.forEach(p=> p.draw());
	}
	constructor(x, y, r, v) {
		this.Pos = vec2(x, y);
		this.r   = r;
		this.v   = v.mul(2);
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
			ctx.moveTo(0,0);
			ctx.lineTo(...vec2(this.v).mul(2).vals);
			ctx.lineWidth = 3;
			ctx.strokeStyle = Color;
			ctx.stroke();
		ctx.restore();
	}
}
$on('Reset Ready Clear Dropped Respawn',_=> {
	Lasers.forEach(s=> s.clear());
	BurstSet.clear();
});
import {Vec2}     from '../lib/vec2.js';
import {Ticker}   from '../lib/timer.js';
import {Sound}    from '../snd/sound.js';
import {cvs,ctx}  from './_canvas.js';
import {Game}     from './_main.js';
import {Mouse}    from './mouse.js';
import {Demo}     from './demo.js';
import {Scene}    from './scene.js';
import {Paddle}   from './paddle.js';
import {Army}     from './army.js';
import {BrickMgr} from './brick.js';
import {Collider} from './rect.js';

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
	static {$on({mousedown: Laser.#fire})}
	static #fire(e) {
		if (!Paddle.launched || Paddle.CatchEnabled) {return}
		if (!Paddle.LaserEnabled || !Mouse.acceptEvent(e)) {return}
		if (Lasers[L].size < Rapid
		 || Lasers[R].size < Rapid) {
			Lasers[L].add(new Laser(L));
			Lasers[R].add(new Laser(R));
			Sound.stop('shot').play('shot');
		}
	}
	static update() {
		if (Scene.isInDemo && Ticker.count % 8 == 0) {
			Demo.canFireLaser && Laser.#fire();
		}
		if (!Game.isPlayScene) {return}
		Lasers[L].forEach(l=> l.update());
		Lasers[R].forEach(l=> l.update());
		Burst.update();
	}
	static draw() {
		if (!Game.isPlayScene) {return}
		Lasers[L].forEach(l=> l.draw());
		Lasers[R].forEach(l=> l.draw());
		Burst.draw();
	}
	constructor(side) {
		const offset = BrickMgr.ColWidth / 2;
		const y = Paddle.y - RadiusY;
		super(side == L
			? Vec2(Paddle.centerX-offset, y).xFreeze()
			: Vec2(Paddle.centerX+offset, y).xFreeze(),
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
			army.crash(army.MaxHp);
			Lasers[this.side].delete(this);
		}
	}
	#collisionWithBrickOrFeild() {
		const object = this.hitT;
		if (object) {
			object.crash();
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
		const v = Vec2(x, y);
		for (let i=90-150/2; i<=90+150/2; i+=30) {
			const cv = Vec2.fromDegrees(i);
			BurstSet.add( new Burst(x, y, cv) );
		}
	}
	static update() {
		BurstSet.forEach(p=> p.update());
	}
	static draw() {
		BurstSet.forEach(p=> p.draw());
	}
	constructor(x, y, v) {
		this.Pos = Vec2(x, y);
		this.r   = RadiusX;
		this.v   = v.mul(RadiusX / 2);
		this.cnt = 0;
	}
	update() {
		this.cnt++;
		if (this.cnt >= 8) {
			BurstSet.delete(this);
		}
		this.Pos.add(this.v);
	}
	draw() {
		ctx.save();
		ctx.translate(...this.Pos.vals);
		ctx.beginPath();
			ctx.lineWidth   = RadiusX;
			ctx.strokeStyle = Color;
			ctx.moveTo(0,0);
			ctx.lineTo(...Vec2(this.v).mul(6).vals);
		ctx.stroke();
		ctx.restore();
	}
}
$on('Reset Ready Clear EndDemo Dropped Respawn', ()=> {
	Lasers.forEach(s=> s.clear());
	BurstSet.clear();
});
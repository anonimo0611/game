import {cvs}	  from './canvas.js';
import {Draw}     from './draw.js';
import {Monster}  from './monster.js';
import {Monsters} from './monster.js';
import {Player}   from './player.js';
import {Players}  from './player.js';

export class Bullet {
	static Max    = 16;
	static Radius =  8;
	static Speed  =  4;
	static fire(bullets, r, pos) {
		bullets.forEach((b,i)=> b.#fire(i, r, pos));
	}
	static update(bullets) {
		let isMoving = false;
		bullets.forEach(b=> {
			if (b.velocity.magnitude <= 0) return;
			isMoving = true;
			b.update();
		});
		return isMoving;
	}
	pos      = vec2();
	velocity = vec2();
	radius   = Bullet.Radius;
	get x() {return this.pos.x}
	get y() {return this.pos.y}
	constructor(color) {
		this.color = color;
		freeze(this);
	}
	update() {
		this.pos.add(this.velocity);
		this.#resetOffScreenBullets();
	}
	#resetOffScreenBullets() {
		if (
		this.pos.x <= -Bullet.Radius ||
		this.pos.y <= -Bullet.Radius ||
		this.pos.x > cvs.width  + Bullet.Radius ||
		this.pos.y > cvs.height + Bullet.Radius)
			this.velocity.set();
	}
	#fire(i, r, srcPos) {
		const v   = vec2(getCircum(360/Bullet.Max * i).pos);
		const pos = vec2(v).mul(r).add(srcPos);
		this.pos.set(pos);
		this.velocity.set( v.mul(Bullet.Speed) );
	}
}
Bullet.Player = class extends Bullet {
	static draw() {
		for (const p of Players)
			for (const b of p.bullets)
				if (b.velocity.magnitude > 0)
					Draw.ball(b);
	}
	update() {
		super.update();
		for (const m of Monsters) {
			if (m.hp <= 0)
				continue;
			if (Vec2.distance(this.pos, m.pos) >= Bullet.Radius + m.radius)
				continue;

			const v = Vec2.sub(m.pos, this.pos).normalized;
			v.mul( Vec2.dot(this.velocity, v) );
			m.takeDamage( int(v.magnitude * 50) );
			this.velocity.set();
		}
	}
}
Bullet.Monster = class extends Bullet {
	static draw() {
		const m = Monster.current;
		if (Monster.currentIndex < 0) return;
		for (const b of m.bullets)
			if (b.velocity.magnitude > 0)
				Draw.ball(b);
	}
	update() {
		super.update();
		for (const p of Players) {
			if (Vec2.distance(this.pos, p.pos) >= Bullet.Radius + Player.Radius)
				continue;
			const v = Vec2.sub(p.pos, this.pos).normalized;
			v.mul( Vec2.dot(this.velocity, v) );
			p.takeDamage( int(v.magnitude * 100) );
			this.velocity.set();
		}
	}
}
freeze(Bullet);
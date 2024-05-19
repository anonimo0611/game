import {cvs}	        from './canvas.js';
import {Monsters}       from './monster.js';
import {Player,Players} from './player.js';

export class Bullet {
	static Max    = 16;
	static Radius =  8;
	static Speed  =  4;
	static makePlayerBullet()  {return new PlayerBullet() }
	static makeMonsterBullet() {return new MonsterBullet()}
	position = vec2(0, 0);
	velocity = vec2(0, 0);
	resetOffScrBullets() {
		if (
		this.position.x <= -Bullet.Radius ||
		this.position.x > cvs.width + Bullet.Radius ||
		this.position.y <= -Bullet.Radius ||
		this.position.y > cvs.height + Bullet.Radius)
			this.velocity.set(0, 0);
	}
	update() {
		this.position.add(this.velocity);
		this.resetOffScrBullets();
	}
	fire(i, r, srcPos) {
		const v   = vec2(getCircum(360/Bullet.Max * i).pos);
		const pos = vec2(v).mul(r).add(srcPos);
		this.position.set(pos);
		this.velocity.set(v.mul(Bullet.Speed));
	}
	static fire(bullets, r, pos) {
		bullets.forEach((b,i)=> b.fire(i, r, pos));
	}
	static update(bullets) {
		let isMoving = false;
		bullets.forEach(b=>{
			if (b.velocity.magnitude <= 0)
				return;
			isMoving = true;
			b.update();
		});
		return isMoving;
	}
}
freeze(Bullet);

class PlayerBullet extends Bullet {
	update() {
		super.update();
		for (const m of Monsters) {
			if (m.hp <= 0)
				continue;
			if (Vec2.distance(this.position, m.position) >= Bullet.Radius + m.radius)
				continue;

			const v = Vec2.sub(m.position, this.position).normalized;
			v.mul(Vec2.dot(this.velocity, v));
			m.damage += int(v.magnitude * 50);
			this.velocity.set(0, 0);
		}
	}
}
class MonsterBullet extends Bullet {
	update() {
		super.update();
		for (const p of Players) {
			if (Vec2.distance(this.position, p.position) >= Bullet.Radius + Player.Radius)
				continue;

			const v = Vec2.sub(p.position, this.position).normalized
			v.mul(Vec2.dot(this.velocity, v));
			p.takeDamage(int(v.magnitude * 100));
			this.velocity.set(0, 0);
		}
	}
}
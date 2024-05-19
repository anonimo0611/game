import * as Draw  from './draw.js';
import {cvs}      from './canvas.js';
import {Phase}    from './phase.js';
import {Monsters} from './monster.js';
import {Bullet}   from './bullet.js';

const {drawShadow,drawBall,drawNumber,drawBar}= Draw;

export class Player {
	static Max    =  4;
	static Radius = 24;
	static MaxHp  = 1e4;
	static #hp	  = this.MaxHp;
	static #lstHp = this.MaxHp;
	static Colors = [
		{r: 92, g:	0, b:	0, a: 1},
		{r:  0, g: 50, b:	0, a: 1},
		{r:  0, g: 50, b: 100, a: 1},
		{r: 50, g:	0, b: 100, a: 1}
	];
	static #currentIdx = 0;
	static get hp() {
		return this.#hp;
	}
	static get lstHp() {
		return this.#lstHp;
	}
	static get currentIdx() {
		return this.#currentIdx;
	}
	static get current() {
		return Players[this.#currentIdx];
	}
	static init() {
		this.#hp = this.#lstHp = this.MaxHp;
		this.#currentIdx = 0;
		Players.forEach((_,i)=>{
			Players[i] = new Player(i);
			Players[i].position.set(
				(1+i) * cvs.width / (Players.length+1),
				cvs.height - Player.Radius * 3
			);
		});
	}
	static update() {
		if (Phase.isMonster)
			return;
		Player.#lstHp -= Player.MaxHp / (60*3);
		Player.#lstHp  = max(Player.#lstHp, Player.hp);
	}
	static setIndex(idx) {
		this.#currentIdx = idx;
	}
	static dropShadow() {
		for (const p of Players)
			drawShadow(Player.Radius, p.position, p.color);
	}
	static #dropBullets() {
		for (const p of Players)
			p.#drawBullet();
	}
	static drawPlayers() {
		const cP = Player.current;
		for (const p of Players)
			p.#drawBall();
		drawBall(Player.Radius, cP.position, cP.color);
		this.#dropBullets();
	}
	static #drawHp() {
		drawBar(
			Player.hp,
			Player.MaxHp,
			Player.lstHp,
			vec2(cvs.width / 2, cvs.height - 18),
			vec2(cvs.width - 32, 12),
			'rgb(100%, 75%,0%)', 'rgb(0%,100%,0%)'
		);
	}
	static drawStatus() {
		for (const p of Players)
			p.#drawDamage();
		Player.#drawHp();
	}
	#index	 = 0;
	damage	 = 0;
	position = vec2(0, 0);
	velocity = vec2(0, 0);
	bullets  = Array(Bullet.Max).fill().map(Bullet.makePlayerBullet);
	get color() {
		return Player.Colors[this.#index]
	}
	constructor(idx, color) {
		this.#index = idx;
	}
	#drawBall() {
		if (this != Player.current)
			drawBall(Player.Radius, this.position, this.color);
	}
	#drawDamage() {
		if (this.damage <= 0)
			return;
		drawNumber(
			this.damage,
			vec2(this.position).add(0, -Player.Radius),
			26, 'rgb(100%,50%,50%)'
		);
	}
	#drawBullet() {
		for (const b of this.bullets)
			if (b.velocity.magnitude > 0)
				drawBall(Bullet.Radius, b.position, this.color);
	}
	rebound() {
		const lastPos = vec2(this.position);
		this.position.add(this.velocity);
		if (this.position.x < Player.Radius) {
			this.position.set(lastPos);
			this.velocity.set(Vec2.reflect(this.velocity, vec2(1, 0)));
		}
		if (this.position.x > cvs.width - Player.Radius) {
			this.position.set(lastPos);
			this.velocity.set(Vec2.reflect(this.velocity, vec2(-1, 0)));
		}
		if (this.position.y < Player.Radius) {
			this.position.set(lastPos);
			this.velocity.set(Vec2.reflect(this.velocity, vec2(0, 1)));
		}
		if (this.position.y > cvs.height - Player.Radius) {
			this.position.set(lastPos);
			this.velocity.set(Vec2.reflect(this.velocity, vec2(0, -1)));
		}
	}
	friendCombo() {
		for (const p of Players) {
			if (this == p || p.velocity.magnitude > 0)
				continue;

			if (Vec2.distance(this.position, p.position) < Player.Radius * 2) {
				const v = Vec2.sub(p.position, this.position).normalized;
				v.mul(Vec2.dot(this.velocity, v)).mul(.5);
				p.velocity.set(v);
				if (!p.bullets.some(b=>b.velocity.magnitude > 0))
					Bullet.fire(p.bullets, Player.Radius, p.position);
			}
		}
	}
	attack() {
		for (const m of Monsters) {
			if (m.hp <= 0)
				continue;
			if (Vec2.distance(this.position, m.position) >= Player.Radius + m.radius)
				continue;

			const v = Vec2.sub(m.position, this.position).normalized;
			v.mul(Vec2.dot(this.velocity, v));

			const h = Vec2.sub(this.velocity, v)
			this.velocity.set(h.normalized.mul(this.velocity.magnitude));
			m.shakeVelocity.add(v);

			const damage = int(v.magnitude * 100);
			m.damage += damage;
			m.hp -= damage;
			m.hp  = max(m.hp, 0);
		}
	}
	takeDamage(damage) {
		this.damage += damage;
		Player.#hp -= this.damage;
		Player.#hp	= max(Player.#hp, 0);
	}
}
freeze(Player);
export const Players = Array(Player.Max).fill();
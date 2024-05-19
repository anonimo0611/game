import * as Draw from './draw.js';
import {cvs}     from './canvas.js';
import {Phase}   from './phase.js';
import {Bullet}  from './bullet.js';

const {drawShadow,drawBall,drawNumber,drawBar} = Draw;

export class Monster {
	static {
		$on('DOMContentLoaded',this.#setup)
	}
	static #setup() {
		[
		    // position, radius, color, turnWaitMax, maxHp
			[vec2(1*(cvs.width/6),32*3), 32, {r:100, g: 66, b: 10, a:0}, 3,  5600],
			[vec2(5*(cvs.width/6),32*3), 32, {r: 20, g: 40, b:100, a:0}, 2,  5600],
			[vec2(1*(cvs.width/6),32*9), 32, {r:100, g: 66, b: 10, a:0}, 3,  5600],
			[vec2(5*(cvs.width/6),32*9), 32, {r:100, g: 66, b: 10, a:0}, 3,  5600],
			[vec2(3*(cvs.width/6),32*6), 80, {r: 50, g:  0, b:100, a:0}, 2, 17000]
		].forEach(p=> Monsters.push(new Monster(...p)));
	}
	static get currentIdx() {
		return Monsters.findIndex(m=>m.hp > 0 && m.turnWait <= 0);
	}
	static get current() {
		return Monsters[this.currentIdx];
	}
	static init() {
		for (const m of Monsters) {
			m.color.a = 1;
			m.turnWait = m.turnWaitMax;
			m.hp = m.lstHp = m.maxHp;
		}
	}
	static update() {
		for (const m of Monsters)
			m.update();
	}
	static drawBullet() {
		const cM = Monster.current;
		if (Monster.currentIdx < 0)
			return;
		for (const b of cM.bullets)
			if (b.velocity.magnitude > 0)
				drawBall(Bullet.Radius, b.position, cM.color);
	}
	static dropShadow() {
		for (const m of Monsters)
			drawShadow(m.radius, Vec2.add(m.position, m.shakePos), m.color);
	}
	static drawMonsters() {
		for (const m of Monsters) {
			m.drawBall();
			Monster.drawBullet();
		}
	}
	static drawNumbers() {
		for (const m of Monsters) {
			if (m.hp <= 0 || Phase.isOver)
				continue;
			m.drawDamage();
			m.drawTurn();
		}
	}
	static drawBars() {
		for (const m of Monsters) {
			if (m.hp <= 0 || Phase.isOver)
				continue;
			m.drawHp();
		}
	}
	hp    = 0;
	maxHp = 0;
	lstHp = 0;
	turnWait = 0;
	damage	 = 0;
	bullets  = Array(Bullet.Max).fill().map(Bullet.makeMonsterBullet);
	position = vec2(0, 0);
	shakePos = vec2(0, 0);
	shakeVelocity = vec2(0, 0);
  
	constructor(position, radius, color, turnWaitMax, maxHp) {
		this.position.set(position);
		this.color	= color;
	   	this.radius = radius;
	   	this.maxHp  = maxHp;
	   	this.turnWaitMax = turnWaitMax;
		setReadonlyProp(this, 'maxHp',       maxHp);
		setReadonlyProp(this, 'turnWaitMax', turnWaitMax);
	}
	update() {
		this.shakeVelocity.sub(Vec2.mul(this.shakePos, 0.1));
		this.shakeVelocity.mul(.925);
		this.shakePos.add(this.shakeVelocity);

		if (!Phase.isFire) {
			this.lstHp -= this.maxHp / (60*3)
			this.lstHp	= max(this.lstHp, this.hp);
		}
		if (this.hp <= 0) {
			this.color.a -= 1 / (60*3);
			this.color.a  = max(this.color.a, 0);
		}
	}
	drawBall() {
		drawBall(
			this.radius,
			Vec2.add(this.position, this.shakePos),
			this.color
		);
	}
	drawDamage() {
		if (this.damage > 0)
			drawNumber(
				this.damage,
				vec2(this.position).sub(0, this.radius),
				26, 'rgb(100% 50% 50%)',
			);
	}
	drawTurn() {
		const color = [
			'rgb(100% 25%  25%)',
			'rgb(100% 25%  25%)',
			'rgb(100% 66%  10%)',
			'rgb( 25% 80% 100%)'
		][this.turnWait];
		drawNumber(
			this.turnWait,
			vec2(this.position).add(this.radius, this.radius),
			30, color,
		);
	}
	drawHp() {
		drawBar(
			this.hp, this.maxHp, this.lstHp,
			vec2(this.position).add(0, this.radius),
			vec2(this.radius, this.radius / 6),
			'rgb(100% 75% 0%)',
			'rgb(100% 75% 0%)',
		);
	}
}
export const Monsters = [];
import {Ticker}   from '../lib/timer.js';
import {rgbaPct}  from '../lib/color.js';
import {Draw}     from './draw.js';
import {cvs,ctx}  from './canvas.js';
import {Phase}    from './phase.js';
import {Monsters} from './monster.js';
import {Bullet}   from './bullet.js';

export const Players = [];

const Radius = 24;
const Colors = [
	rgbaPct(92,  0,   0),
	rgbaPct( 0, 50,   0),
	rgbaPct( 0, 50, 100),
	rgbaPct(50,  0, 100),
];
const CursorGrad = ctx.createRadialGradient(0,0,Radius*3/4, 0,0,Radius*2);
CursorGrad.addColorStop(0.0, rgbaPct(100, 75, 25, 0.0));
CursorGrad.addColorStop(1.0, rgbaPct(100, 75, 25, 1.0));

let cursorScale = 0;
let cursorCount = 0;

export class Player {
	static Max    =  4;
	static MaxHp  = 1e4;
	static Radius = Radius;
	static #hp	  = this.MaxHp;
	static #lstHp = this.MaxHp;
	static #currentIdx = 0;
	static get hp()    {return this.#hp}
	static get lstHp() {return this.#lstHp}
	static get currentIndex() {
		return this.#currentIdx;
	}
	static get current() {
		return Players[this.currentIndex];
	}
	static init() {
		cursorScale = 0;
		cursorCount = 0;
		this.#hp = this.#lstHp = this.MaxHp;
		this.#currentIdx = 0;
		for (let i=0; i<this.Max; i++) {
			Players[i] = new Player(i);
			Players[i].pos.x = (1+i) * cvs.width / (this.Max+1);
			Players[i].pos.y = cvs.height - Radius * 3;
		}
	}
	static update() {
		for (const p of Players)
			p.#update();
		if (Phase.isMonster) {
			this.#lstHp -= this.MaxHp / (60*3);
			this.#lstHp  = max(this.#lstHp, this.hp);
		}
	}
	static setNextTurn() {
		cursorScale = 0;
		cursorCount = 0;
		this.#currentIdx =
			(this.Max + this.currentIndex+1) % this.Max;
	}
	static dropShadow() {
		for (const p of Players)
			Draw.shadow(p);
	}
	static drawPlayers() {
		for (const p of Players)
			p.#draw();
		Draw.ball(this.current);
		Bullet.Player.draw();
	}
	static drawStatus() {
		for (const p of Players)
			p.#drawDamage();
		Draw.hpBar(
			this, {
			pos:    vec2(cvs.width/2, cvs.height-18),
			size:   vec2(cvs.width-32, 12),
			lColor: rgbaPct(100,  75, 0),
			rColor: rgbaPct(  0, 100, 0),
			}
		);
	}
	static drawCursor() {
		if (!Phase.isIdle) return;
		const pos = vec2(this.current.pos)
		pos.y += sin(Ticker.count * PI*2 / 60) * Radius/8;
		cursorScale += sin(cursorCount++ * PI*2 / 45) / 8;

		ctx.save();
		ctx.translate(...pos.vals);
		ctx.beginPath();
			ctx.fillStyle = CursorGrad;
			ctx.arc(0,0, max(0, Radius*cursorScale), 0, PI*2);
		ctx.fill();
		ctx.restore();
	}
	#index	 = 0;
	#damage	 = 0;
	#clash   = 0;
	pos      = vec2();
	velocity = vec2();
	radius   = Radius;
	get x()      {return this.pos.x}
	get y()      {return this.pos.y}
	get clash()  {return this.#clash > 0}
	get damage() {return this.#damage}
	get color()  {return Colors[this.#index]}
	constructor(idx) {
		this.#index = idx;
		this.#setBullets();
		freeze(this);
	}
	#setBullets() {
		this.bullets = Array(Bullet.Max).fill()
			.map(()=> new Bullet.Player(this.color));
	}
	#update() {
		if (this.#clash > 0)
			this.#clash--;
	}
	#draw() {
		if (this != Player.current)
			Draw.ball(this);
	}
	#drawDamage() {
		if (this.#damage <= 0) return;
		Draw.number(
			this.#damage, 26, rgbaPct(100, 50, 50),
			vec2(this.pos).add(0, -Radius),
		);
	}
	rebound(lastPos) {
		const {pos,velocity:v}= this;
		if (pos.x < Player.Radius) {
			pos.set(lastPos);
			v.set( Vec2.reflect(v,[1,0]) );
		}
		if (pos.x > cvs.width - Radius) {
			pos.set(lastPos);
			v.set( Vec2.reflect(v,[-1,0]) );
		}
		if (pos.y < Radius) {
			pos.set(lastPos);
			v.set( Vec2.reflect(v,[0,1]) );
		}
		if (pos.y > cvs.height - Radius) {
			pos.set(lastPos);
			v.set( Vec2.reflect(v,[0,-1]) );
		}
	}
	friendCombo() {
		if (this.velocity.magnitude <= 0) return;
		for (const p of Players) {
			if (this == p || p.velocity.magnitude > 0) continue;
			if (Vec2.distance(this.pos, p.pos) < Radius*2) {
				const v = this.pos.normalized;
				v.mul(Vec2.dot(this.velocity, v)).mul(.5);
				p.velocity.set(v);
				if (!p.bullets.some(b=> b.velocity.magnitude > 0))
					Bullet.fire(p.bullets, Radius, p.pos);
			}
		}
	}
	attack(lastPos) {
		for (const m of Monsters) {
			const dist = Vec2.distance(this.pos, m.pos);
			if (m.hp <= 0) continue;
			if (dist >= Radius+m.radius) continue;

			this.pos.set(lastPos);
			const v = Vec2.sub(m.pos, this.pos).normalized;
			v.mul( Vec2.dot(this.velocity, v) );

			const h = Vec2.sub(this.velocity, v)
			this.velocity.set( h.normalized.mul(this.velocity.magnitude) );
			m.Shake.velocity.add(v);

			const damage = int(v.magnitude*100);
			m.takeDamage(damage);
		}
	}
	turnChanged() {
		this.#clash  = 0;
		this.#damage = 0;
	}
	takeDamage(damage) {
		this.#clash = 10;
		this.#damage += damage;
		Player.#hp -= this.#damage;
		Player.#hp	= max(Player.#hp, 0);
	}
}
freeze(Player);
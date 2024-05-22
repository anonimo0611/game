import {rgbaPct} from '../lib/color.js';
import {Draw}    from './draw.js';
import {cvs}     from './canvas.js';
import {Phase}   from './phase.js';
import {Bullet}  from './bullet.js';

const InitVals = [
    // position, radius, color, TurnWaitMax, MaxHp
	[vec2(1*(cvs.width/6),32*3), 32, rgbaPct(100, 66,  10), 3,  5000],
	[vec2(5*(cvs.width/6),32*3), 32, rgbaPct( 20, 40, 100), 2,  5000],
	[vec2(1*(cvs.width/6),32*9), 32, rgbaPct(100, 66,  10), 3,  5000],
	[vec2(5*(cvs.width/6),32*9), 32, rgbaPct(100, 66,  10), 3,  5000],
	[vec2(3*(cvs.width/6),32*6), 80, rgbaPct( 50,  0, 100), 2, 15000],
];
export const Monsters = Array(InitVals.length);

export class Monster {
	static {$ready(this.#setup)}
	static #setup() {
		for (let i=0; i<InitVals.length; i++)
			Monsters[i] = new Monster(...InitVals[i], new Shake);
	}
	static get current() {
		return Monsters[this.currentIndex];
	}
	static get currentIndex() {
		return Monsters.findIndex(m=> m.hp > 0 && m.#turnWait <= 0);
	}
	static init() {
		for (const m of Monsters) {
			m.#alpha = 1;
			m.#hp = m.#lstHp = m.MaxHp;
			m.#turnWait = m.TurnWaitMax;
		}
	}
	static update() {
		for (const m of Monsters)
			m.#update();
	}
	static dropShadow() {
		for (const m of Monsters)
			Draw.shadow(m, m.Shake.pos.clone);
	}
	static drawMonsters() {
		for (const m of Monsters)
			Draw.ball(m, m.Shake.pos.clone);
		Bullet.Monster.draw();
	}
	static drawStatus() {
		for (const m of Monsters) {
			if (m.hp <= 0 || Phase.isOver) continue;
			m.#drawDamage();
			m.#drawTurn();
		}
	}
	static drawHpBars() {
		for (const m of Monsters) {
			if (m.hp <= 0 || Phase.isOver) continue;
			m.#drawHp();
		}
	}
	#hp       = 0;
	#lstHp    = 0;
	#alpha    = 1;
	#turnWait = 0;
	#clash    = 0;
	#damage	  = 0;
	get x()     {return this.pos.x}
	get y()     {return this.pos.y}
	get hp()    {return this.#hp}
	get lstHp() {return this.#lstHp}
	get alpha() {return this.#alpha}
	get clash() {return this.#clash > 0}
	constructor(pos, radius, color, TurnWaitMax, MaxHp, Shake) {
		this.pos    = vec2(pos).freeze();
		this.color  = color;
	   	this.radius = radius;
	   	this.Shake  = Shake;
	   	this.MaxHp  = MaxHp;
	   	this.TurnWaitMax = TurnWaitMax;
	   	this.#setBullets();
		freeze(this);
	}
	#setBullets() {
		this.bullets = Array(Bullet.Max).fill()
			.map(()=> new Bullet.Monster(this.color));
	}
	#update() {
		this.Shake.update();
		if (!Phase.isFire) {
			this.#lstHp -= this.MaxHp / (60*3)
			this.#lstHp	= max(this.#lstHp, this.hp);
		}
		if (this.#clash > 0)
			this.#clash--;
		if (this.hp <= 0) {
			this.#alpha -= 1 / (60*3);
			this.#alpha  = max(this.#alpha, 0);
		}
	}
	#drawDamage() {
		if (this.#damage > 0)
			Draw.number(
				this.#damage, 26, rgbaPct(100, 50, 50),
				vec2(this.pos).sub(0, this.radius),
			);
	}
	#drawTurn() {
		const colors = [
			rgbaPct(100, 25,  25),
			rgbaPct(100, 25,  25),
			rgbaPct(100, 66,  10),
			rgbaPct( 25, 80, 100),
		];
		Draw.number(
			this.#turnWait, 30, colors[this.#turnWait],
			vec2(this.pos).add(this.radius, this.radius),
		);
	}
	#drawHp() {
		Draw.hpBar(
			this, {
			pos:    vec2(this.pos).add(0, this.radius),
			size:   vec2(this.radius, this.radius/6),
			lColor: rgbaPct(100, 75, 0),
			rColor: rgbaPct(100, 75, 0),
			}
		);
	}
	resetTurnWait() {
		this.#turnWait = this.TurnWaitMax;
	}
	turnChanged() {
		this.#turnWait--;
		this.#clash  = 0;
		this.#damage = 0;
	}
	takeDamage(damage) {
		this.#clash = 10;
		this.#damage += damage;
		this.#hp -= damage;
		this.#hp  = max(this.#hp, 0);
	}
}
class Shake {
	pos      = vec2();
	velocity = vec2();
	constructor() {freeze(this)}
	update() {
		this.velocity.sub(Vec2.mul(this.pos, 0.1)).mul(.925);
		this.pos.add(this.velocity);
	}
}
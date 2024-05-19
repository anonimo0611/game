import {Ticker}   from '../lib/timer.js';
import {cvs,ctx}  from './_canvas.js';
import {FontSize} from './_canvas.js';
import {Actor}    from './actor.js';
import {Status}   from './status.js';

class Player extends Actor {
	#damage = 0;
	#heal   = 0;
	#offset = 0;
	#color  = 'white';
	get damaging() {
		return this.#damage > 0;
	}
	get healing() {
		return this.#heal > 0;
	}
	get color() {
		return (this.#damage > 0 || this.#heal > 0)
			? this.#color
			: this.baseColor;
	}
	get baseColor() {
		if (this.healing) return '#FFF';
		return (this.hp <= 40 ? '#FFCC99' : '#FFF');
	}
	get offset() {
		return this.#damage > 0 ? this.#offset : 0;
	}
	constructor() {
		const level = 20;
		super(Status[level-1]);
		this.level   = level;
		this.attack  = this.strength + 40;
		this.defence = this.agility/2 + 28 + 20;
		this.hp = this.maxHp;
		this.mp = this.maxMp;
		$on('PlayerHeal',   _=> this.#heal   = 45);
		$on('PlayerDamage', _=> this.#damage = 45);
	}
	update() {
		if (this.#damage > 0) {
			this.#offset = randInt(4,-4);
			this.#damage--;
			if (Ticker.count %  5 == 0) this.#color = 'red';
			if (Ticker.count % 10 == 0) this.#color = this.baseColor;
			return;
		}
		if (this.#heal > 0) {
			this.#heal--;
			if (Ticker.count %  5 == 0) this.#color = 'cyan';
			if (Ticker.count % 10 == 0) this.#color = this.baseColor;
			return;
		}
		this.#color = 'white';
	}
}
export let player = new Player;
$on('Start', _=> player = new Player);
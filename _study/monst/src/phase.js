import {State}            from '../lib/state.js';
import {Bullet}           from './bullet.js';
import {Player,Players}   from './player.js';
import {Monster,Monsters} from './monster.js';

export const Phase = freeze(new class extends State {
	isIdle	  = false;
	isHold	  = false;
	isFire	  = false;
	isMonster = false;
	isOver	  = false;
	isClear   = false;
	constructor() {
		super();
		this.init();
	}
	update() {
		this.isFire    && this.#fire();
		this.isMonster && this.#monster();
	}
	#fire() {
		let isMoving = false;
		for (const p of Players) {
			if (p.velocity.magnitude > 0) {
				isMoving = true;
				const lastPos = vec2(p.pos);
				const lastVelocity = vec2(p.velocity);
				p.velocity.sub(p.velocity.normalized.mul(0.075));
				if (Vec2.dot(p.velocity, lastVelocity) <= 0)
					p.velocity.set();

				p.pos.add(p.velocity);
				p.rebound(lastPos);
				if (p == Player.current && p.velocity.magnitude > 0)
					p.friendCombo();

				p.attack(lastPos);
			}
			if (Bullet.update(p.bullets))
				isMoving = true;
		}
		if (isMoving) return;
		Player.setNextTurn();
		for (const m of Monsters)
			m.turnChanged();
		if (Monster.currentIndex >= 0) {
			const m = Monster.current;
			Phase.switchToMonster();
			Bullet.fire(m);
		} else
			Monsters.every(m=> m.hp == 0)
				? Phase.switchToClear()
				: Phase.switchToIdle();
	}
	#monster() {
		if (Bullet.update(Monster.current.bullets))
			return;
		Monster.current.resetTurnWait();
		if (Monster.currentIndex >= 0) {
			Bullet.fire(Monster.current);
			return;
		}
		for (const p of Players)
			p.turnChanged();
		Player.hp > 0
			? Phase.switchToIdle()
			: Phase.switchToOver();
	}
});
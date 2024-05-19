import {State}            from '../lib/state.js';
import {Bullet}           from './bullet.js';
import {Player,Players}   from './player.js';
import {Monster,Monsters} from './monster.js';

export const Phase = freeze(new class extends State {
	isIdle	  = true;
	isHold	  = false;
	isFire	  = false;
	isMonster = false;
	isOver	  = false;
	isClear   = false;
	constructor() {
		super();
		this.init();
	}
	switch(scene) {
		super.switch(scene);
	}
	fire() {
		let isMoving = false;
		for (const p of Players) {
			if (p.velocity.magnitude > 0) {
				isMoving = true;
				const lastVelocity = vec2(p.velocity);
				p.velocity.sub(p.velocity.normalized.mul(.075));
				if (Vec2.dot(p.velocity, lastVelocity) <= 0)
					p.velocity.set(0, 0);

				p.rebound();
				if (p == Player.current && p.velocity.magnitude > 0)
					p.friendCombo();

				p.attack();
			}
			if (Bullet.update(p.bullets))
				isMoving = true;
		}

		if (isMoving) return;
		Player.setIndex((Player.Max + Player.currentIdx + 1) % Player.Max);
		for (const m of Monsters) {
			m.turnWait--;
			m.damage = 0;
		}
		if (Monster.currentIdx >= 0) {
			const m = Monster.current;
			Phase.switch(Phase.enum.Monster);
			Bullet.fire(m.bullets, m.radius, m.position);
		} else
			Monsters.every(m=>m.hp == 0)
				? Phase.switch(Phase.enum.Clear)
				: Phase.switch(Phase.enum.Idle);
	}
	monster() {
		let isMoving = false;
		let m = Monster.current;
		isMoving ||= Bullet.update(m.bullets);
		if (!isMoving) {
			m.turnWait = m.turnWaitMax;
			m = Monster.current;
			if (Monster.currentIdx >= 0)
				Bullet.fire(m.bullets, m.radius, m.position);
			else {
				for (const p of Players)
					p.damage = 0;
				Player.hp <= 0
					? Phase.switch(Phase.enum.Over)
					: Phase.switch(Phase.enum.Idle);
			}
		}
	}
});
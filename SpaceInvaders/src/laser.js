import {Sound}      from '../snd/sound.js';
import {Ticker}     from '../lib/timer.js';
import {cvs,ctx}    from './_canvas.js';
import {Scene}      from './scene.js';
import {Ground}     from './ground.js';
import {Score}      from './score.js';
import {Lives}      from './lives.js';
import {Player}     from './player.js';
import {InvaderMgr} from './invader.js';
import {Invader}    from './invader.js';
import {UfoMgr}     from './ufo.js';
import {Bunker}     from './bunker.js';
import {Explosion1} from './explosion.js';
import {Explosion2} from './explosion.js';

const BurstSet = new Set();

class Laser {
	constructor({x, y}, speed=1) {
		this.Pos      = vec2(x, y);
		this.Velocity = vec2(0, speed);
	}
	get tipPos() {
		return this.Velocity.y > 0 && this.y+this.Height < Bunker.Top
			? vec2(this.Pos).add(0, this.Height)
			: vec2(this.Pos);
	}
	update() {
		this.Pos.add(this.Velocity);
	}
};
export class PlayerLaser extends Laser {
	static Rapid = 2;
	static IntervalMax = 6;
	Width  = int(cvs.width / 160);
	Height = Player.Height;
	constructor({x, y}) {
		super({x, y}, -cvs.height / 60);
		this.Pos.x += Player.Width / 2;
		this.Pos.y += -this.Height / 2;
		freeze(this);
	}
	update() {
		super.update();
		if (Bunker.collision(this, false)) {
			Player.LaserSet.delete(this);
			Burst.set(this.tipPos, Player.Color);
			return;
		}
		for (const [idx,invader] of InvaderMgr.Map) {
			if (!collisionRect(this,invader)) continue;
			Sound.stop('killed').play('killed');
			new Explosion1(invader);
			InvaderMgr.Map.delete(idx);
			Player.LaserSet.delete(this);
			Score.add(invader.Points);
			return;
		}
		const ufo = UfoMgr.currentInstance;
		if (ufo && collisionRect(this,ufo)) {
			ufo.destroy();
			return;
		}
		if (this.Pos.y < Score.Bottom) {
			Player.LaserSet.delete(this);
			Burst.set(this.tipPos, Player.Color);
		}
	}
	draw() {
		if (Scene.isClear) return;
		const {Width:w,Height:h}= this;
		ctx.save();
		ctx.translate(this.Pos.x, this.Pos.y-this.Height/2);
		ctx.beginPath();
		ctx.moveTo(0,0);
		ctx.lineTo(0,h);
		ctx.lineWidth   = w;
		ctx.strokeStyle = Player.Color;
		ctx.stroke();
		ctx.restore();
	}
} freeze(PlayerLaser);

const InvaderShootMgr = new class {
	shoot() {
		const {Max,LaserMap,Map:map}= InvaderMgr;
		if (Ticker.count < 60) return;
		if (LaserMap.size >= (map.size > Max/2 ? 1 : 2)) return;
		const inv = randChoice(this.#shootableInvaders);
		inv && LaserMap.set(inv, new InvaderLaser(inv));
	}
	get #shootableInvaders() {
		const ret = [];
		for (const [idx,inv] of InvaderMgr.Map) {
			if (InvaderMgr.LaserMap.has(inv)) continue;
			if (this.#lowerColumnExists(idx)) continue;
			ret.push(inv)
		} return ret;
	}
	#lowerColumnExists(i) {
		const {Cols,Rows,Map:map}= InvaderMgr;
		const col = int(i % Cols);
		const row = int(i / Cols);
		for (let y=row; y<=Rows; y++) {
			const x = col + (y*Cols);
			if (map.has(x + Cols)) return true;
		} return false;
	}	
}
export class InvaderLaser extends Laser {
	static shoot() {InvaderShootMgr.shoot()}
	#owner;
	#aIdx  = -1;
	Width  = int(cvs.width / 160);
	Height = InvaderMgr.Size * 3/4;
	constructor(owner) {
		if (!(owner instanceof Invader)) return;
		super(owner.Pos, cvs.height / (60*3));
		this.Pos.x += owner.Width / 2;
		this.Pos.y += owner.Height;
		this.#owner = owner;
		freeze(this);
	}
	update() {
		super.update();
		if (Ticker.count % 6 == 0)
			this.#aIdx *= -1;
		if (Bunker.collision(this, true)) {
			InvaderMgr.LaserMap.delete(this.#owner);
			Burst.set(this.tipPos, this.#owner.Color, true);
			return;
		}
		for (const playerLaser of Player.LaserSet) {
			if (!collisionRect(this,playerLaser)) continue;
			Player.LaserSet.clear();
			InvaderMgr.LaserMap.delete(this.#owner);
			Burst.set(this.tipPos.add(0,-2), this.#owner.Color, true);
			Burst.set(this.tipPos.add(0,+2), Player.Color);
			return;
		}
		if (collisionRect(this,Player)) {
			Sound.stop().play('explosion');
			new Explosion2(Player, {duration:1000});
			if (Lives.left == 1) {
				Scene.switch(Scene.enum.GameOver);
				return;
			}
			Scene.switch(Scene.enum.Destroy);
			Scene.switch(Scene.enum.Respawn, 800);
			return;
		}
		if (this.Pos.y + this.Height > Ground.Top) {
			const pos = vec2(this.Pos.x, Ground.Top);
			Burst.set(pos, this.#owner.Color, true);
			Ground.crack(pos.sub(this.Width/2, 0));
			InvaderMgr.LaserMap.delete(this.#owner);
		}
	}
	draw() {
		if (Scene.isClear) return;
		const {Width:w,Height:h}= this;
		const a = this.#aIdx;
		ctx.save();
			ctx.translate(this.Pos.x, this.Pos.y);
			ctx.lineWidth   = 2;
			ctx.strokeStyle = this.#owner.Color;
			ctx.beginPath();
				ctx.moveTo(0, 0);
				ctx.lineTo(0, h);
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(-w*a, 0.00);
				ctx.lineTo( w*a, 0.25*h);
				ctx.lineTo(-w*a, 0.50*h);
				ctx.lineTo( w*a, 0.75*h);
				ctx.lineTo(-w*a, 1.00*h);
			ctx.stroke();
		ctx.restore();
	}
} freeze(InvaderLaser);

export class Burst {
	static set({x, y}, color, counterclockwise=false) {
		const v = vec2(x, y);
		for (let i=90-40; i<=90+40; i+=10) {
			const cx = cos(i*PI/180) * 1.2;
			const cy = sin(i*PI/180) * 1.2;
			const cv = vec2(cx, counterclockwise ? -cy : cy);
			BurstSet.add(new Burst(color, x, y, cv));
		}
	}
	static update() {
		BurstSet.forEach(p=> p.update());
	}
	static draw() {
		BurstSet.forEach(p=> p.draw(ctx));
		//BurstSet.forEach(p=> p.draw(Bunker.ctx));
	}
	#counter = 0;
	constructor(color, x, y, v) {
		this.v     = v.mul(2);
		this.color = color;
		this.stPos = vec2(x, y);
		this.edPos = vec2(x, y);
	}
	update() {
		if (this.#counter++ >= 9)
			BurstSet.delete(this);
		this.edPos.add(this.v);
	}
	draw(ctx) {
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(...this.stPos.vals);
		ctx.lineTo(...this.edPos.vals);
		ctx.lineWidth   = 3;
		ctx.strokeStyle = this.color;
		ctx.stroke();
		ctx.restore();
	}
}
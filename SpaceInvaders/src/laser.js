import {Sound}      from '../snd/sound.js';
import {Ticker}     from '../lib/timer.js';
import {Vec2}       from '../lib/vec2.js';
import {Rect}       from '../lib/rect.js';
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

class Laser extends Rect {
	constructor(pos, {width,height,speed=1}) {
		super(Vec2(pos), width, height);
		this.Velocity = Vec2(0, speed);
	}
	get tipPos() {
		const {Owner,Pos,Velocity:v,Width,Height}= this;
		const bottom = Owner.y + Owner.Height;
		const tipPos = Vec2(Pos).add(0, v.y < 0 ? 0 : Height);
		if (v.y > 0 && bottom >= Bunker.Top && Bunker.contains(tipPos)) {
			tipPos.y = bottom + Width;
		}
		return tipPos;
	}
	update() {
		this.Pos.add(this.Velocity);
	}
};
export class PlayerLaser extends Laser {
	static Rapid = 1;
	static IntervalMax = 6;
	get Owner() {return Player}

	constructor({x, y}) {
		super({x, y}, {
			width:  int(cvs.width / 160),
			height: Player.Height,
			speed: -cvs.height / 60,
			}
		);
		this.Pos.x += Player.Width / 2;
		this.Pos.y -= this.Height;
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
			if (!this.collisionRect(invader)) {continue}
			Sound.stop('killed').play('killed');
			new Explosion1(invader);
			InvaderMgr.Map.delete(idx);
			Player.LaserSet.delete(this);
			Score.add(invader.Score);
			return;
		}
		const ufo = UfoMgr.currentInstance;
		if (ufo && !ufo.destroyed && this.collisionRect(ufo)) {
			ufo.destroy();
			Player.LaserSet.delete(this);
			return;
		}
		if (this.y < Score.Bottom) {
			Player.LaserSet.delete(this);
			Burst.set(this.tipPos, Player.Color);
		}
	}
	draw() {
		if (Scene.isClear) {return}
		const {Width:w,Height:h}= this;
		ctx.save();
		ctx.translate(...this.Pos.vals);
		ctx.beginPath();
			ctx.lineWidth   = w;
			ctx.strokeStyle = Player.Color;
			ctx.moveTo(0, 0);
			ctx.lineTo(0, h);
		ctx.stroke();
		ctx.restore();
	}
} freeze(PlayerLaser);

class InvaderLaser extends Laser {
	#aIdx = -1;
	#owner;
	get Owner() {return this.#owner}

	constructor(owner) {
		if (!(owner instanceof Invader)) {return}
		super(owner.Pos, {
			width:  int(cvs.width / 80),
			height: InvaderMgr.Size * 3/4,
			speed:  cvs.height / (60*3),
			}
		);
		this.Pos.x += owner.Width /2;
		this.Pos.y += owner.Height/2;
		this.#owner = owner;
		freeze(this);
	}
	update() {
		super.update();
		if (Ticker.count % 6 == 0) {
			this.#aIdx *= -1;
		}
		if (Bunker.collision(this, true)) {
			InvaderMgr.LaserMap.delete(this.Owner);
			Burst.set(this.tipPos, this.Owner.Color, true);
			return;
		}
		for (const playerLaser of Player.LaserSet) {
			if (!this.collisionRect(playerLaser)) {continue}
			Player.LaserSet.clear();
			InvaderMgr.LaserMap.delete(this.Owner);
			Burst.set(this.tipPos.add(0,-2), this.Owner.Color, true);
			Burst.set(this.tipPos.add(0,+2), Player.Color);
			return;
		}
		if (this.collisionRect(Player)) {
			Sound.stop().play('explosion');
			new Explosion2(Player, {duration:1000});
			if (Lives.left == 1) {
				Scene.switchToGameOver();
				return;
			}
			Scene.switchToDestroy();
			Scene.switchToRespawn(800);
			return;
		}
		if (this.y + this.Height > Ground.Top) {
			const pos = Vec2(this.x, Ground.Top);
			Burst.set(pos, this.Owner.Color, true);
			Ground.crack(pos);
			InvaderMgr.LaserMap.delete(this.Owner);
		}
	}
	draw() {
		if (Scene.isClear) {return}
		const {Width:w,Height:h}= this;
		const aIdx = this.#aIdx;
		ctx.save();
		ctx.translate(...this.Pos.vals);
		ctx.lineWidth   = w/4;
		ctx.strokeStyle = this.Owner.Color;
		ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(0, h);
			ctx.moveTo(-w/2 * aIdx, 0.00);
			ctx.lineTo( w/2 * aIdx, 0.25 * h);
			ctx.lineTo(-w/2 * aIdx, 0.50 * h);
			ctx.lineTo( w/2 * aIdx, 0.75 * h);
			ctx.lineTo(-w/2 * aIdx, 1.00 * h);
		ctx.stroke();
		ctx.restore();
	}
} freeze(InvaderLaser);

export const InvaderShoot = new class {
	fire() {
		const {Max,LaserMap,Map:InvMap}= InvaderMgr;
		if (Ticker.count < 60) {return}
		if (LaserMap.size >= (InvMap.size > Max/2 ? 1 : 2)) {return}
		const inv = randChoice(this.#shootableInvaders);
		inv && LaserMap.set(inv, new InvaderLaser(inv));
	}
	get #shootableInvaders() {
		const ret = [];
		for (const [idx,inv] of InvaderMgr.Map) {
			if (InvaderMgr.LaserMap.has(inv)) {continue}
			if (this.#lowerColumnExists(idx)) {continue}
			ret.push(inv);
		} return ret;
	}
	#lowerColumnExists(i) {
		const {Cols,Rows,Map:InvMap}= InvaderMgr;
		const col = int(i % Cols);
		const row = int(i / Cols);
		for (let y=row; y<=Rows; y++) {
			const x = col + (y*Cols);
			if (InvMap.has(x + Cols)) {return true}
		} return false;
	}	
}

export class Burst {
	static set({x, y}, color, counterclockwise=false) {
		const v = Vec2(x, y), span = 2;
		for (let i=90-30; i<=90+30; i+=span) {
			const cx = cos(i*PI/180) * 1.2;
			const cy = sin(i*PI/180) * 1.2;
			const cv = Vec2(cx, counterclockwise ? -cy : cy);
			BurstSet.add( new Burst(color, x+cos(i)*2, y, span, cv) );
		}
	}
	static update() {
		BurstSet.forEach(p=> p.update());
	}
	static draw() {
		BurstSet.forEach(p=> p.draw(ctx));
		BurstSet.forEach(p=> p.draw(Bunker.ctx));
	}
	#counter = 0;
	constructor(color, x, y, width, v) {
		this.v     = v.mul(2);
		this.color = color;
		this.width = width;
		this.stPos = Vec2(x, y);
		this.edPos = Vec2(x, y);
	}
	update() {
		if (this.#counter++ >= 8) {
			BurstSet.delete(this);
		}
		this.edPos.add(this.v);
	}
	draw(ctx) {
		ctx.save();
		ctx.beginPath();
			ctx.lineWidth   = this.width;
			ctx.strokeStyle = this.color;
			ctx.moveTo(...this.stPos.vals);
			ctx.lineTo(...this.edPos.vals);
		ctx.stroke();
		ctx.restore();
	}
}
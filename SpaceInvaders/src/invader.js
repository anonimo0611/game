import {Ticker}       from '../lib/timer.js';
import {Rect}         from '../lib/rect.js';
import {Sound}        from '../snd/sound.js';
import {cvs,ctx}      from './_canvas.js';
import {Game}         from './_main.js';
import {Scene}        from './scene.js';
import {Player}       from './player.js';
import {Bunker}       from './bunker.js';
import {InvaderShoot} from './laser.js';
import {UfoMgr,Ufo}   from './ufo.js';
import * as Sprite    from './invader_sprite.js';
import {Explosion1}   from './explosion.js';

const BaseSize = cvs.width / 16;

export const InvaderMgr = freeze(new class {
	Rows       =  5;
	Cols       = 11;
	Size       = BaseSize;
	RowHeight  = BaseSize;
	ColWidth   = BaseSize  * 1.2;
	Max        = this.Cols * this.Rows;
	Map        = new Map();
	LaserMap   = new Map();
	#bgmCnt    = 0;
	#bgmIndex  = 2;
	#iterator  = this.Map.values();
	#current   = this.#iterator.next();

	Step = this.ColWidth / 4;
	Velocity     = vec2();
	NextVelocity = vec2();

	get Current() {
		return this.#current?.value;
	}
	#reset() {
		this.Map.clear();
		this.LaserMap.clear();
		this.Velocity.set(this.Step, 0);
		this.NextVelocity.set(this.Velocity);
		this.#bgmCnt   = 0;
		this.#bgmIndex = 2;
		this.#iterator = this.Map.values();
		this.#current  = this.#iterator.next();
		for (let y=this.Rows-1; y>=0; y--) {
			for (let x=0; x<this.Cols; x++) {
				const idx = y * this.Cols + x;
				const instance = (()=> {
					if (y == 0) return new Squid(idx);
					if (y <= 2) return new Crab(idx);
					if (y >= 3) return new Octpus(idx);
				})();
				this.Map.set(idx, instance);
			}
		}
	}
	init() {
		this.#reset();
		const {Cols,Rows,ColWidth:w,RowHeight:h}= this;
		const RoundY   = Game.roundNum * BaseSize*.8;
		const marginL  = cvs.width/2 - (w*Cols)/2;
		const marginT  = this.RowHeight * 2;
		const maxWidth = this.Map.get(0).Width;
		this.Map.forEach((invader, i)=> {
			const offsetX = (maxWidth - invader.Width) / 2;
			const offsetY = (h - invader.Height) / 2;
			invader.Pos.x = int(i % Cols) * w + marginL + offsetX;
			invader.Pos.y = int(i / Cols) * h + marginT + offsetY + RoundY;
		});
	}
	#move() {
		const {Pos,Width,Height}= this.Current;
		const {Step,Velocity,NextVelocity}= this;
		this.Current.addTurn();
		Pos.add(Velocity);
		if (Pos.x >= cvs.width-Width-Step && Velocity.x > 0) {
			NextVelocity.set(-Step, Step);
		}
		if (Pos.x < Step && Velocity.x < 0) {
			NextVelocity.set(Step, Step);
		}
		if (Pos.y+Height >= Player.Pos.y+Player.Height) {
			Scene.switchToGameOver();
		}
	}
	update() {
		if (!Scene.isInGame) {return}
		if (++this.#bgmCnt >= this.Map.size) {
			this.#bgmCnt = 0;
			Sound.play(`se${this.#bgmIndex = ++this.#bgmIndex % 4}`);
		}
		UfoMgr.update();
		InvaderMgr.LaserMap.forEach(l=> l.update());
		if (Explosion1.exisits) {return}
		if (this.Current) {this.#move()}
		if (this.Map.size == 0) {
			Sound.stop('ufo_high');
			Scene.switchToClear();
			return;
		}
		this.#current = this.#iterator.next();
		if (this.#current.done) {
			this.#iterator = this.Map.values();
			this.#current  = this.#iterator.next();
			this.Velocity.set(this.NextVelocity);
			this.NextVelocity.y = 0;
			InvaderShoot.fire();
		}
	}
	draw() {
		this.LaserMap.forEach(l=> l.draw());
		this.Map.forEach(i=> i.draw(ctx));
		this.Map.forEach(i=> i.draw(Bunker.ctx));
		UfoMgr.draw();
	}
});
export class Invader extends Rect {
	#turn   = 0;
	#aIndex = 1;
	constructor(i) {
		super(vec2(), BaseSize, BaseSize);
		this.index = i
	}
	get turn()   {return this.#turn}
	get aIndex() {return this.#aIndex}
	addTurn() {
		this.#turn++;
		this.#aIndex ^= 1;
	}
	draw(ctx, idx) {
		if (this.turn < 1) {return}
		const {Width:w,Height:h}= this;
		ctx.save();
		ctx.translate(...this.Pos.asInt.vals);
		ctx == Bunker.ctx
			? ctx.clearRect(0,0, w,h)
			: Sprite.draw(ctx, this.Type, this.aIndex);
		ctx.restore();
	}
}
class Octpus extends Invader {
	Type   = Sprite.InvaderType.Octpus;
	Color  = '#F69';
	Points = 10;
	constructor(i) {
		super(i);
		freeze(this);
	}
}
class Crab extends Invader {
	Type   = Sprite.InvaderType.Crab;
	Width  = BaseSize * .8;
	Height = this.Width / 1.15;
	Color  = '#8EF';
	Points = 20;
	constructor(i) {
		super(i);
		freeze(this);
	}
}
class Squid extends Invader {
	Type   = Sprite.InvaderType.Squid;
	Width  = BaseSize * .7;
	Height = BaseSize * .7;
	Color  = '#FF9';
	Points = 30;
	constructor(i) {
		super(i);
		freeze(this);
	}
}
Sprite.setup(Octpus,Crab,Squid,Ufo);
$on('Title Respawn Clear', ()=> {InvaderMgr.LaserMap.clear()});
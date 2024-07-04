import {Sound}       from '../snd/sound.js';
import {Ticker}      from '../lib/timer.js';
import {Rect}        from '../lib/rect.js';
import {rgba}        from '../lib/color.js';
import {cvs,ctx}     from './_canvas.js';
import {Ground}      from './ground.js';
import {Scene}       from './scene.js';
import {PlayerLaser} from './laser.js';
import {InvaderMgr}  from './invader.js';
import {Bunker}      from './bunker.js';

const PressedKeySet = new Set();
const InvMap = InvaderMgr.Map;

export const Player = freeze(new class extends Rect {
	Color    = '#6F6';
	Speed    = cvs.width / (60*3);
	LaserSet = new Set();
	#lstShot = -1;
	constructor() {
		super(vec2(), InvaderMgr.Size, InvaderMgr.Size/1.5);
		$on('keydown', this.#onKeyDown.bind(this));
		$on('keyup',   this.#onKeyUp.bind(this));
		[this.cvs,this.ctx]= canvas2D(null, this.Width, this.Height).vals;
	}
	init() {
		PressedKeySet.clear();
		this.LaserSet.clear();
		this.Pos.set(
			this.Width/2,
			Bunker.Bottom + this.Height
		);
		this.#lstShot = -1;
		this.cache(this.ctx);
	}
	#onKeyDown(e) {
		if (!Scene.isInGame || e.repeat) {return}
		PressedKeySet.add(e.key);
	}
	#onKeyUp(e) {
		if (!Scene.isInGame) {return}
		PressedKeySet.delete(e.key);
	}
	#shoot() {
		if (Ticker.count - this.#lstShot > PlayerLaser.IntervalMax
			&& this.LaserSet.size < PlayerLaser.Rapid
		) {
			Sound.stop('shoot').play('shoot');
			this.LaserSet.add( new PlayerLaser(this.Pos) );
			this.#lstShot = Ticker.count;
		}
	}
	update() {
		if (!Scene.isInGame) {return}
		if (Ticker.count < InvMap.size) {return}
		const {Speed,Pos,Width}= this;
		this.LaserSet.forEach(l=> l.update());
		PressedKeySet.has('\x20')       && Player.#shoot();
		PressedKeySet.has('ArrowLeft')  && (Pos.x -= Speed);
		PressedKeySet.has('ArrowRight') && (Pos.x += Speed);
		Pos.x = clamp(Pos.x, 0, cvs.width-Width);
	}
	draw() {
		if (Scene.isDestroy || Scene.isGameOver) {return}
		if (Scene.isInGame && Ticker.count < InvMap.size) {return}
		ctx.save();
		ctx.translate(...this.Pos.asInt.vals);
		ctx.drawImage(this.cvs, 0,0);
		ctx.restore();
		this.LaserSet.forEach(l=> l.draw());
	}
	cache(ctx) {
		const {Width:w, Height:h}= this;
		ctx.save();
		ctx.translate(w/2, h/2);
		ctx.scale(w, h);
		ctx.beginPath();
		    ctx.moveTo(   0, -.50);
			ctx.lineTo(+.10, -.35);
			ctx.lineTo(+.12, -.10);
			ctx.lineTo(+.40, -.10);
			ctx.lineTo(+.50, +.10);
			ctx.lineTo(+.50, +.50);
			ctx.lineTo(-.50, +.50);
			ctx.lineTo(-.50, +.10);
			ctx.lineTo(-.40, -.10);
			ctx.lineTo(-.12, -.10);
			ctx.lineTo(-.10, -.35);
		ctx.closePath();
		ctx.fillStyle = Player.Color;
		ctx.fill();
		ctx.restore();
	}
});
$on('Respawn Clear', ()=> Player.LaserSet.clear());
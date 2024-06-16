import {Vec2}     from '../lib/vec2.js';
import {U,R,D,L}  from '../lib/direction.js';
import {State}    from '../lib/state.js';
import {Ticker}   from '../lib/timer.js';
import {HSL,hsl}  from '../lib/color.js';
import {rgba}     from '../lib/color.js';
import {Sound}    from '../snd/sound.js';
import {Game}     from './_main.js';
import {cvs,ctx}  from './_canvas.js';
import {Field}    from './field.js'
import {Scene}    from './scene.js';
import {Score}    from './score.js';
import {BrickMgr} from './brick.js';
import {Collider} from './rect.js'
import {Paddle}   from './paddle.js';

const {ColWidth,RowHeight}= Field;

const ArmyMax  = 4;
const ArmySet  = new Set();
const Interval = 5000 / Ticker.Interval;
const Radius   = ColWidth / 2.3;
const SphereR  = Radius / (5/3);
const Width    = Radius*2;
const Height   = Radius*2;
const SpawnL   = int(cvs.width/3 - Radius);
const SpawnR   = (cvs.width - SpawnL) - Width;

const DriftRadiusX = cvs.width/200;
const DriftRadiusY = cvs.width/300;
const DriftGravity = 0.3;

const SphereRedHSL  = HSL(  0,  90, 40);
const SphereLimeHSL = HSL(135, 100, 40);
const SphereCyanHSL = HSL(195, 100, 40);

const ExplosionSet  = new Set();
const ExplosionHSL  = HSL(180, 400, 49);
const ParticleColor = '#1BE3B7';

const Crawl = freeze(new class {
	Speed = cvs.width / 420;
	get [U]() {return Vec2[U].mul(this.Speed)}
	get [R]() {return Vec2[R].mul(this.Speed)}
	get [D]() {return Vec2[D].mul(this.Speed)}
	get [L]() {return Vec2[L].mul(this.Speed)}
});

class Phase extends State {
	isNone       = true;
	isHolizontal = false;
	isDown       = false;
	isUp         = false;
	isClimbed    = false;
	constructor() {
		super();
		this.init();
	}
}

class Explosion {
	static Duration = 28;
	static FadeoutStart    = this.Duration - 8;
	static FadeoutDuration = this.Duration - this.FadeoutStart;
	static update() {
		ExplosionSet.forEach(exp=> exp.update());
	}
	static draw() {
		ExplosionSet.forEach(exp=> exp.draw());
	}
	#cnt   = 0;
	#alpha = 1;
	ParticleSet = new Set();
	constructor({x, y}) {
		const {h,s,l}= ExplosionHSL;
		this.Pos  = Vec2(x, y);
		this.r    = Radius*1.6;
		this.Grad = ctx.createRadialGradient(0,0,0, 0,0,this.r);
		this.Grad.addColorStop(0.0, hsl(h,s,70));
		this.Grad.addColorStop(1.0, hsl(h,s,l,0.1));
		for (let i=0; i<360; i+=360/12) {
			const cv = Vec2.fromDegrees(i).mul(Radius);
			this.ParticleSet.add( new Particle(x,y,cv) );
		}
	}
	update() {
		if (this.#cnt >= Explosion.Duration) {
			this.ParticleSet.clear();
			ExplosionSet.delete(this);
			return;
		}
		if (this.#cnt >= Explosion.FadeoutStart) {
			this.#alpha -= max(1/Explosion.FadeoutDuration, 0);
		}
		this.#cnt++;
		this.ParticleSet.forEach(p=> p.update());
	}
	draw() {
		if (!ExplosionSet.has(this))
			return;
		ctx.save();
		ctx.globalAlpha = this.#alpha;
		this.ParticleSet.forEach(p=> p.draw());
		ctx.translate(...this.Pos.vals);
		fillCircle(ctx)(0,0, this.r, this.Grad);
		ctx.restore();
	}
} freeze(Explosion);

class Particle {
	ParticleSet = new Set();
	constructor(x, y, v) {
		this.Pos = Vec2(x, y).add(v);
		for (let i=0; i<360; i+=360/6) {
			const cv = Vec2.fromDegrees(i);
			this.ParticleSet.add({x,y,cv,r:SphereR/7});
		}
	}
	update() {
		for (const p of this.ParticleSet) {
			p.cv.mul(1.13);
			p.r -= 1/60;
		}
	}
	draw() {
		ctx.save();
		ctx.translate(...this.Pos.vals);
		for (const {cv,r} of this.ParticleSet)
			fillCircle(ctx)(...cv.vals, r, ParticleColor);
		ctx.restore();
	}
}

class Sphere {
	#Grad  = null;
	#shake = 0;
	constructor(HSL) {
		this.HSL = HSL;
		freeze(this);
	}
	#color({h,s,l}, damaging) {
		damaging && (h =  0);
		damaging && (l = 80);
		this.#setGrad(h,s,l,SphereR);
		return {h,s,l};
	}
	#setGrad(h,s,l,r) {
		this.#Grad = ctx.createRadialGradient(-r/2,-r/2,0, 0,0,r);
		this.#Grad.addColorStop(0.0,'#FFF');
		this.#Grad.addColorStop(0.2, hsl(h,s,80));
		this.#Grad.addColorStop(1.0, hsl(h,s,l));
	}
	draw(x, y, damaging=false, isShadow=false) {
		const {h,l}  = this.#color(this.HSL, damaging && !isShadow);
		const color  = isShadow? hsl(h,30,l, 0.8) : this.#Grad;
		const offset = isShadow? Radius/1.9 : 0;
		const shake  = damaging? sin(this.#shake+=PI/8)*(SphereR*0.3) : 0;
		ctx.save();
		ctx.translate(x+offset+shake, y+offset);
		fillCircle(ctx)(0,0, SphereR, color);
		ctx.restore();
	}
}
export class Army extends Collider {
	static {
		$on({'InGame InDemo': ()=> this.#counter = 0});
	}
	static #counter  = 0;
	static ArmySet   = ArmySet;
	static Explosion = Explosion;
	static detectCollided(obj) {
		for (const army of ArmySet)
			if (army.#alpha == 1 && army.collisionRect(obj))
				return army;
	}
	static update() {
		if (!Game.isPlayScene || !Paddle.launched)
			return;
		if (this.#counter++ >= Interval && ArmySet.size < ArmyMax) {
			this.#counter = 0;
			ArmySet.add(new Army);
		}
		ArmySet.forEach(a=> a.#update());
		Explosion.update();
	}
	static draw() {
		if (BrickMgr.brokenAll)
			return;
		ArmySet.forEach(a=> a.#drawSpheres(true)); // shadow
		ArmySet.forEach(a=> a.#drawSpheres());
	}
	MaxHp       = 30;
	#hp         = this.MaxHp;
	#phase      = new Phase();
	#alpha      = 0;
	#animAngle  = 0;
	#moveAngle  = 0;
	#downCnt    = 0;
	#climbedCnt = 0;
	#damaging   = 0;
	#lastLR     = null;
	#animPos    = Vec2();
	#destroyed  = false;
	Sphere = freeze({
		r: new Sphere(SphereRedHSL),
		g: new Sphere(SphereLimeHSL),
		c: new Sphere(SphereCyanHSL),
	});
	constructor() {
		const x = randInt(0,1) ? SpawnL : SpawnR;
		const y = Field.Top + Radius;
		super({x, y}, Radius);
		this.Velocity = Crawl.Down;
		freeze(this);
	}
	get Phase()     {return this.#phase}
	get damaging()  {return this.#damaging > 0}
	get destroyed() {return this.#destroyed}
	get #canDrift() {
		const {row,col}= this.TilePos;
		return row > 6 && [
			[0,-1],[0,-2],[-1, 0],[-2, 0],[-1,-1],[1,-1],
			[1, 0],[2, 0],[ 0, 1],[ 0, 2],[-1, 1],[1, 1]
		].every(([x,y])=> !this.getBrick({row,col},{x,y})?.exists);
	}
	#update() {
		this.#updateAnim();
		if (this.destroyed || this.#alpha < 1)
			return;

		if (this.#damaging > 0)
			this.#damaging--;

		this.Pos.x = clamp(this.x, Field.Left+Radius, Field.Right-Radius);
		this.#move();
		if (this.Velocity.x)
			this.#lastLR = this.Velocity.x < 0 ? L : R;

		if (Paddle.collisionRect(this)) {
			this.crash(this.MaxHp);
			return;
		}
		if (this.y-Radius > cvs.height)
			ArmySet.delete(this);
	}
	#updateAnim() {
		this.#alpha = min(this.#alpha+1/30, 1);
		this.#animPos.set( Vec2.fromRadians(this.#animAngle+=PI/60) )
	}
	#moveCircum() {
		this.Pos.x += cos(this.#moveAngle+=PI/1e3) * DriftRadiusX;
		this.Pos.y += sin(this.#moveAngle+=PI/200) * DriftRadiusY + DriftGravity;
	}
	#move() {
		this.#canDrift
			? this.#moveCircum()
			: this.Pos.add(this.Velocity);

		const {Phase,hitT,hitR,hitB,hitL,hitLB,hitRB}= this;

		if (Phase.isNone && (hitLB || hitRB))
			this.#setHolizontalDir(this);
		if (Phase.isUp && hitT)
			this.#setHolizontalDir(this);

		if (Phase.isClimbed) {
			if (this.#climbedCnt++ <= (Width/2) / abs(this.Velocity.x))
				return;
			Phase.switchToHolizontal();
		}
		if (hitB && (hitL || hitR) != Field) {
			(Phase.isHolizontal || Phase.isDown) && (hitL || hitR)
				? this.Velocity.set(Crawl[Phase.switchToUp()])
				: this.#setHolizontalDir(this);
		}
		if (Phase.isHolizontal && !Phase.isClimbed && !hitLB && !hitRB) {
			this.Velocity.set(Crawl[Phase.switchToDown()]);
		}
		if (Phase.isUp && !hitT && !hitLB && !hitRB) {
			this.#climbedCnt = 0;
			this.Velocity.set(Crawl[this.#lastLR]);
			Phase.switchToClimbed();
		}
		if (Phase.isHolizontal && (hitL || hitR)) {
			this.Velocity.x *= -1;
		}
		Phase.isDown
			? (this.#downCnt++)
			: (this.#downCnt = 0);
	}
	#setHolizontalDir({Velocity:v}) {
		this.Phase.switchToHolizontal();
		const twoStepsDowned = this.#downCnt/(RowHeight/v.y) > 1;
		const dir = twoStepsDowned && !this.hitLB3Q && !this.hitRB3Q
			? randChoice(L,R)
			: this.#lastLR ?? randChoice(L,R);
		v.set(Crawl[dir]);
	}
	crash(damagePoints) {
		this.#hp -= damagePoints;
		if (this.#hp <= 0) {
			this.#destroyed = true;
			Army.#counter = 0;
			ArmySet.delete(this);
			ExplosionSet.add( new Explosion(this.Pos) );
			Score.add(100);
			Sound.stop('bomb').play('bomb');
		} else
			this.#damaging = 1;
	}
	#drawSpheres(isShadow=false) {
		if (this.destroyed)
			return;

		const {x,y}= this.#animPos, r = SphereR*0.8;
		const cfg = [this.damaging, isShadow];
		ctx.save();
		ctx.globalAlpha = this.#alpha;
		ctx.translate(...this.Pos.vals);
		if (x < -.33) {
			this.Sphere.g.draw(-x*r,-y*r, ...cfg);
			this.Sphere.r.draw(-x*r, y*r, ...cfg);
			this.Sphere.c.draw( x*r,-y*r, ...cfg);
		} else if (y > .66 ) {
			this.Sphere.r.draw(-x*r, y*r, ...cfg);
			this.Sphere.c.draw( x*r,-y*r, ...cfg);
			this.Sphere.g.draw(-x*r,-y*r, ...cfg);
		} else {
			this.Sphere.c.draw( x*r,-y*r, ...cfg);
			this.Sphere.g.draw(-x*r,-y*r, ...cfg);
			this.Sphere.r.draw(-x*r, y*r, ...cfg);
		}
		ctx.restore();
	}
} freeze(Army);

$on('Reset Ready Clear EndDemo Dropped Respawn', ()=> {
	ArmySet.clear();
	ExplosionSet.clear();
});
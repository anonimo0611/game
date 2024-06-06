import {U,R,D,L}  from '../lib/direction.js';
import {State}    from '../lib/state.js';
import {Ticker}   from '../lib/timer.js';
import {HSL,hsl}  from '../lib/color.js';
import {rgba}     from '../lib/color.js';
import {Sound}    from '../snd/sound.js';
import {cvs,ctx}  from './_canvas.js';
import {Game}     from './_main.js';
import {Field}    from './field.js'
import {Scene}    from './scene.js';
import {Score}    from './score.js';
import {BrickG}   from './brick.js';
import {Collider} from './brick.js'
import {Paddle}   from './paddle.js';

const ArmyMax  = 4;
const ArmySet  = new Set();
const Interval = 5000; // ms
const Radius   = BrickG.ColWidth / 2.3;
const SphereR  = Radius / (5/3);
const Width    = Radius*2;
const Height   = Radius*2;
const SpawnL   = int(cvs.width/3 - Radius);
const SpawnR   = (cvs.width - SpawnL) - Width;

const DriftRadiusX = cvs.width/252;
const DriftRadiusY = cvs.width/315;
const DriftGravity = 0.4;

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
	#ParticleSet = new Set();
	constructor({x, y}) {
		const {h,s,l}= ExplosionHSL;
		this.Pos  = vec2(x, y);
		this.r    = Radius*1.6;
		this.Grad = ctx.createRadialGradient(0,0,0, 0,0,this.r);
		this.Grad.addColorStop(0.0, hsl(h,s,70));
		this.Grad.addColorStop(1.0, hsl(h,s,l,0.1));
		for (let i=0; i<360; i+=360/12) {
			const cx = cos(i*PI/180) * Radius;
			const cy = sin(i*PI/180) * Radius;
			const cv = vec2(cx,cy);
			this.#ParticleSet.add(new Particle(x,y,cv))
		}
		ExplosionSet.add(this);
	}
	update() {
		if (this.#cnt >= Explosion.Duration) {
			this.#ParticleSet.clear();
			ExplosionSet.delete(this);
			return;
		}
		if (this.#cnt >= Explosion.FadeoutStart) {
			this.#alpha -= max(1/Explosion.FadeoutDuration, 0);
		}
		this.#cnt++;
		this.#ParticleSet.forEach(p=> p.update());
	}
	draw() {
		if (!ExplosionSet.has(this)) return;
		ctx.save();
		ctx.globalAlpha = this.#alpha;
		this.#ParticleSet.forEach(p=> p.draw());
		ctx.translate(...this.Pos.vals);
		fillCircle(ctx)(0,0, this.r, this.Grad);
		ctx.restore();
	}
}
class Particle {
	#ParticleSet = new Set();
	constructor(x, y, v) {
		this.Pos = vec2(x, y).add(v);
		for (let i=0; i<360; i+=360/6) {
			const cx = cos(i*PI/180);
			const cy = sin(i*PI/180);
			const cv = vec2(cx,cy);
			this.#ParticleSet.add({x,y,cv,r:SphereR/7})
		}
	}
	update() {
		for (const p of this.#ParticleSet) {
			p.cv.mul(1.13);
			p.r -= 1/60;
		}
	}
	draw() {
		ctx.save();
		ctx.translate(...this.Pos.vals);
		for (const {cv,r} of this.#ParticleSet)
			fillCircle(ctx)(...cv.vals, r, ParticleColor);
		ctx.restore();
	}
}
freeze(Explosion);

class Sphere {
	constructor(HSL) {
		const r = SphereR;
		const {h,s,l}= HSL;
		this.shadowColor = hsl(h,30,l, 0.8);
		this.Grad = ctx.createRadialGradient(-r/2,-r/2,0, 0,0,r);
		this.Grad.addColorStop(0.0,'white');
		this.Grad.addColorStop(0.2, hsl(h,s,80));
		this.Grad.addColorStop(1.0, hsl(h,s,l));
	}
	draw(x, y, isShadow=false) {
		const offset = isShadow ? Radius/1.9 : 0;
		ctx.save();
		ctx.translate(x+offset, y+offset);
		fillCircle(ctx)(0,0, SphereR, isShadow? this.shadowColor : this.Grad);
		ctx.restore();
	}
}
export class Army extends Collider {
	static Explosion = Explosion;
	static detectCollided(obj) {
		for (const army of ArmySet)
			if (army.#alpha == 1 && collisionRect(obj,army))
				return army;
	}
	static update() {
		if (!Game.isPlayScene || !Paddle.Launched)
			return;
		if (Ticker.count % int(Interval/Ticker.Interval) == 0
			&& ArmySet.size < ArmyMax) new Army();
		ArmySet.forEach(a=> a.#update());
		Explosion.update();
	}
	static draw() {
		if (BrickG.destroyed) return;
		ArmySet.forEach(a=> a.#drawSpheres(true)); // shadow
		ArmySet.forEach(a=> a.#drawSpheres());
	}
	Width       = Radius*2;
	Height      = Radius*2;
	#phase      = new Phase();
	#alpha      = 0;
	#animRad    = 0;
	#moveRad    = 0;
	#downCnt    = 0;
	#climbedCnt = 0;
	#lastLR     = null;
	#animPos    = vec2();
	#destroyed  = false;
	#Sphere     = {
		r: new Sphere(SphereRedHSL),
		g: new Sphere(SphereLimeHSL),
		c: new Sphere(SphereCyanHSL),
	};
	constructor() {
		const x = randInt(0,1) ? SpawnL : SpawnR;
		const y = Field.Top + Radius;
		super({x, y}, Radius);
		this.Velocity = Crawl.Down;
		ArmySet.add(this);
		freeze(this);
	}
	get Phase() {
		return this.#phase;
	}
	get destroyed() {
		return this.#destroyed;
	}
	get #canDrift() {
		const {row,col} = this.tilePos();
		return row > 6 && [
			[0,-1],[0,-2],[-1, 0],[-2, 0],[-1,-1],[1,-1],
			[1, 0],[2, 0],[ 0, 1],[ 0, 2],[-1, 1],[1, 1]
		].every(([x,y])=> !this.getBrick({row,col},{x,y})?.exists);
	}
	#update() {
		this.#updateAnim();
		if (this.destroyed || this.#alpha < 1)
			return;

		this.Pos.x = clamp(this.Pos.x, Field.Left+Radius, Field.Right-Radius);
		this.#move();
		if (this.Velocity.x)
			this.#lastLR = this.Velocity.x < 0 ? L : R;

		if (collisionRect(Paddle,this)) {
			this.destroy();
			return;
		}
		if (this.Pos.y-Radius > cvs.height)
			ArmySet.delete(this);
	}
	#updateAnim() {
		this.#alpha = min(this.#alpha+=1/30, 1);
		this.#animPos.x = cos(this.#animRad+=PI/60);
		this.#animPos.y = sin(this.#animRad+=PI/60);
	}
	#moveCircum() {
		this.Pos.x += cos(this.#moveRad+=PI/1e3) * DriftRadiusX;
		this.Pos.y += sin(this.#moveRad+=PI/200) * DriftRadiusY + DriftGravity;
	}
	#move() {
		this.#canDrift
			? this.#moveCircum()
			: this.Pos.add(this.Velocity);

		const {Phase,hitT,hitR,hitB,hitL,hitLB,hitRB}= this;

		if (Phase.isNone && (hitLB || hitRB))
			this.#setHolizontalDir();
		if (Phase.isUp && hitT)
			this.#setHolizontalDir();

		if (Phase.isClimbed) {
			if (this.#climbedCnt++ <= (Width/2) / abs(this.Velocity.x))
				return;
			Phase.switchToHolizontal();
		}
		if (hitB && (hitL || hitR) != Field) {
			(Phase.isHolizontal || Phase.isDown) && (hitL || hitR)
				? this.Velocity.set(Crawl[Phase.switchToUp()])
				: this.#setHolizontalDir();
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
	#setHolizontalDir() {
		this.Phase.switchToHolizontal();
		const gt1StepDown = this.#downCnt/(BrickG.RowHeight/this.Velocity.y) > 1;
		const dir = (!this.brickExistsOnOneSide && gt1StepDown)
			? randChoice(L,R)
			: this.#lastLR ?? randChoice(L,R);
		this.Velocity.set(Crawl[dir]);
	}
	destroy() {
		this.#destroyed = true;
		new Explosion(this.Pos);
		ArmySet.delete(this);
		Score.add(100);
		Sound.stop('bomb').play('bomb');
	}
	#drawSpheres(isShadow=false) {
		if (this.destroyed) return;
		const {x,y}= this.#animPos;
		const r = SphereR * 0.75;
		ctx.save();
		ctx.globalAlpha = this.#alpha;
		ctx.translate(...this.Pos.vals);
		if (x < -.25) {
			this.#Sphere.g.draw(-x*r,-y*r, isShadow);
			this.#Sphere.r.draw(-x*r, y*r, isShadow);
			this.#Sphere.c.draw( x*r,-y*r, isShadow);
		} else if (x > .75 ) {
			this.#Sphere.c.draw( x*r,-y*r, isShadow);
			this.#Sphere.g.draw(-x*r,-y*r, isShadow);
			this.#Sphere.r.draw(-x*r, y*r, isShadow);
		} else {
			this.#Sphere.r.draw(-x*r, y*r, isShadow);
			this.#Sphere.c.draw( x*r,-y*r, isShadow);
			this.#Sphere.g.draw(-x*r,-y*r, isShadow);
		}
		ctx.restore();
	}
}
freeze(Army);

$on('Reset Ready Clear EndDemo Dropped Respawn', _=> {
	ArmySet.clear();
	ExplosionSet.clear();
});
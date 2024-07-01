import {Vec2}      from '../lib/vec2.js';
import {rgba}      from '../lib/color.js';
import {Sound}     from '../snd/sound.js';
import {Ticker}    from '../lib/timer.js';
import {cvs,ctx}   from './_canvas.js';
import {Game}      from './_main.js';
import {Field}     from './field.js';
import {Stages}    from './stage.js';
import {Lives}     from './lives.js';
import {Scene}     from './scene.js';
import {ItemMgr}   from './item.js';
import {ItemType}  from './item.js';
import {Army}      from './army.js';
import {BrickMgr}  from './brick.js';
import {BrickType} from './brick.js';
import {Collider}  from './rect.js'
import {Paddle}    from './paddle.js';

const Radius        = int(cvs.width / 85);
const [$cvs,$ctx]   = canvas2D(null, Radius*4, Radius*4).vals;
const BallSet       = new Set();
const BallSpeed     = int(cvs.height / 70);
const DisruptionMax = 10;
const SpeedRateMax  = 1.25;
const ArmySpeedDown = 0.85;

export const BallMgr = new class {
	static {$ready(this.#setup)}
	static #setup() {
		$(ItemMgr).on({Obtained: BallMgr.#onPowerUp});
	}
	#speedDownRate = 1;
	get Ball()   {return BallSet.values().next().value}
	get count()  {return BallSet.size}
	get Radius() {return Radius}
	get NearlyBall() {
		return [...BallSet].sort((a,b)=> b.y - a.y)[0];
	}
	get speedDownRate() {
		return BallMgr.#speedDownRate;
	}
	get stageSpeedRate() {
		return 1+(((SpeedRateMax-1)/(Stages.length-1))*Game.stageIdx);
	}
	get initialSpeedRate() {
		return Game.stageNum <= 8 ? [6,6,7,7,8,8,9,9][Game.stageIdx]/10 : 1;
	}
	init() {
		const x = cvs.width/2;
		const y = Paddle.y - Radius;
		!Game.respawned && (BallMgr.#speedDownRate = 1);
		BallSet.clear();
		BallSet.add( new Ball({x,y,v:Paddle.LaunchVelocity}) );
	}
	#onPowerUp(_, type) {
		const {Ball}= BallMgr;
		switch (type) {
		case ItemType.SpeedDown:
			BallMgr.#speedDownRate *= 0.9;
			break;
		case ItemType.Disruption:
			BallMgr.#setDisruption();
			break;
		case ItemType.Catch:
		case ItemType.Expand:
		case ItemType.Laser:
			BallSet.clear();
			BallSet.add(Ball);
			break;
		}
	}
	#setDisruption() {
		for (let i=0; i<DisruptionMax; i++) {
			const {x, y}= BallMgr.Ball;
			const angle = randFloat(90-140/2, 90+140/2);
			const v = Vec2.fromDegrees(angle).inverse;
			BallSet.add( new Ball({x,y,v}) );
		}
	}
	update() {
		if (!Game.isReadyScene && !Game.isPlayScene) {return}
		if (!Paddle.launched) {return}
		BallSet.forEach(ball=> ball.update());
	}
	draw() {
		if (Scene.isClear || Scene.isGameOver) {return}
		BallSet.forEach(ball=> ball.draw());
	}
};
class Ball extends Collider {
	Radius     = Radius;
	Pos        = Vec2();
	Velocity   = Vec2();
	InitSpeed  = (BallSpeed*BallMgr.initialSpeedRate) * BallMgr.stageSpeedRate;
	#speed     = this.InitSpeed;
	#launched  = false;
	Accelerate = 0.02;
	constructor({x,y,v}) {
		super({x, y}, Radius);
		BallSet.size && (this.#speed = BallMgr.Ball.speed);
		this.Pos.set(x, y);
		this.Velocity.set( v.normalized.mul(this.speed) );
		freeze(this);
	}
	get launched() {
		return this.#launched;
	}
	get speed() {
		return this.#speed;
	}
	get isOnWall() {
		const {row,col}= this.TilePos;
		for (let i=row+1; i<BrickMgr.Rows; i++) {
			if (BrickMgr.MapData[i]?.[col]?.exists) {
				return true
			}
		}
		return false;
	}
	#constrain({x,y,Radius:r}) {
		const {Top,Left,Right}= Field;
		this.Pos.x = clamp(x, Left+r, Right-r);
		this.Pos.y = max(y, Top);
	}
	update() {
		if (Game.isReadyScene || Paddle.catchX > 0) {return}
		const Min = this.InitSpeed * 0.7;
		const Max = BallSpeed   * BallMgr.stageSpeedRate;
		const Spd = this.#speed * BallMgr.speedDownRate;
		const Mag = round(this.Velocity.magnitude);

		this.#launched ||= true;
		this.#speed = clamp(this.speed+this.Accelerate, Min, Max);

		if (this.#detectDropped()) {return}
		for (let i=0; i<Mag; i++) {
			this.#bounceAtPaddle();
			!Paddle.catchX
				&& this.Pos.add( this.Velocity.normalized.mul(Spd/Mag) );
			this.#collisionWithArmy();
			this.#collisionWithBrickOrField();
		}
	}
	#detectDropped() {
		if (this.y <= cvs.height || Scene.isClear) {return false}
		//this.Velocity.y *= -1;
		//return false;

		BallSet.delete(this);
		if (BallSet.size > 0) {
			return false;
		}
		if (Game.isDemoScene) {
			Scene.switchToReset();
			return true;
		}
		if (Lives.left <= 0) {
			Sound.stop();
			BallSet.clear();
			Scene.switchToDropped();
			Scene.switchToGameOver();
			Scene.switchToReset(1500);
			return true;
		}
		Sound.stop();
		Scene.switchToDropped();
		Scene.switchToRespawn(1500);
		return true;
	}
	#bounceAtPaddle() {
		if (!Paddle.collisionRect(this)) {return}
		if (Paddle.canCatch) {
			$(BallMgr).trigger('Cought',this);
		}
		this.Velocity.set( Paddle.BounceVelocity.mul(this.speed) );
		Sound.play('se0');
		if (Paddle.catchX) {
			Ticker.Timer.set(200, ()=> Sound.stop('se0'));
		}
	}
	#collisionWithArmy() {
		const army = Army.detectCollided(this);
		if (army) {
			army.crash(army.MaxHp);
			const randDeg = randChoice(45,135,225,315);
			const bounceV = Vec2.fromDegrees(randDeg);
			this.Velocity.set( bounceV.mul(this.#speed*=ArmySpeedDown) );
		}
	}
	#collisionWithBrickOrField() {
		const {Velocity:v,hitT,hitR,hitB,hitL}= this;
		if (hitL) {v.x = +abs(v.x)}
		if (hitR) {v.x = -abs(v.x)}
		if (hitT) {v.y = +abs(v.y)}
		if (hitB) {v.y = -abs(v.y)}
		const brick = this.collidedBrick;
		if (brick) {
			brick.crash();
			if (brick.isImmortality) {
				const vx = (v.x < 0 ? -0.1 : 0.1);
				v.x += randFloat(0, vx);
			}
		}
		if (this.collidedField) {
			this.#constrain(this);
		}
	}
	draw() {
		ctx.save();
		ctx.globalAlpha = Paddle.alpha;
		ctx.translate(...Vec2(this.Pos).sub(Radius).vals);
		ctx.drawImage($cvs, 0,0);
		ctx.restore();
	}
} freeze(Ball);

(new class { // Set up ball graphics
	shadowCfg = {
		color:  rgba(0,0,0, 0.4),
		scale:  Vec2(1, 0.7),
		offset: Vec2(Radius*3/4, Radius*2),
	}
	setup() {
		const
		Grad = $ctx.createRadialGradient(0,0,0, 0,0,Radius);
		Grad.addColorStop(0.00, '#0099FF');
		Grad.addColorStop(0.70, '#55BBFF');
		Grad.addColorStop(0.98, '#55BBFF');
		Grad.addColorStop(1.00, '#FFFFFF');
		this.cache($ctx, ...values(this.shadowCfg));
		this.cache($ctx, Grad);
	}
	cache(ctx, color, scale=Vec2.One, offset=Vec2.Zero) {
		ctx.save();
		ctx.translate(Radius, Radius);
		ctx.scale(...scale.vals);
		fillCircle(ctx)(...offset.vals, Radius, color);
		ctx.restore();
	}
}).setup();
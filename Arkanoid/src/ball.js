import {rgba}      from '../lib/color.js';
import {Sound}     from '../snd/sound.js';
import {Ticker}    from '../lib/timer.js';
import {cvs,ctx}   from './_canvas.js';
import {Game}      from './_main.js';
import {Field}     from './field.js';
import {Stages}    from './stage.js';
import {Lives}     from './lives.js';
import {Scene}     from './scene.js';
import {ItemType}  from './item.js';
import {Army}      from './army.js';
import {BrickG}    from './brick.js';
import {BrickType} from './brick.js';
import {Collider}  from './brick.js'
import {Paddle}    from './paddle.js';

const Radius        = int(cvs.width / 85);
const [$cvs,$ctx]   = canvas2D(null, Radius*4, Radius*4).vals;
const BallSet       = new Set();
const BallSpeed     = int(cvs.height / 70);
const DisruptionMax = 10;
const SpeedRateMax  = 1.25;
const ArmySpeedDown = 0.85;

const
Grad = $ctx.createRadialGradient(0,0,0, 0,0,Radius);
Grad.addColorStop(0.00, '#0099FF');
Grad.addColorStop(0.70, '#55BBFF');
Grad.addColorStop(0.98, '#55BBFF');
Grad.addColorStop(1.00, '#FFFFFF');

const ShadowConfig = {
	color:  rgba(0,0,0, 0.4),
	offset: [Radius*3/4, Radius*2],
	scale:  [1, 0.7],
};

export const BallG = freeze(new class {
	static {$ready(this.#setup)}
	static #setup() {
		BallG.#cache($ctx, ...values(ShadowConfig));
		BallG.#cache($ctx, Grad);
		$on({GotItem:BallG.#onPowerUp});
	}
	Radius = Radius;
	#speedDownRate  = 1;
	get speedDownRate() {
		return BallG.#speedDownRate;
	}
	get stageSpeedRate() {
		return 1+(((SpeedRateMax-1)/(Stages.length-1))*Game.stageIdx);
	}
	get initialSpeedRate() {
		return Game.stageNum <= 8 ? [6,6,7,7,8,8,9,9][Game.stageIdx]/10 : 1;
	}
	get Ball() {
		return BallSet.values().next().value;
	}
	get NearlyBall() {
		return [...BallSet].sort((a,b)=> b.Pos.y - a.Pos.y)[0];
	}
	get count() {
		return BallSet.size;
	}
	InitV = vec2(1, -1).freeze();
	init() {
		const x = cvs.width/2;
		const y = Paddle.Pos.y - Radius;
		if (!Game.respawned)
			BallG.#speedDownRate = 1;
		BallSet.clear();
		BallSet.add( new Ball({x,y,v:this.InitV}) );
	}
	#onPowerUp(_, type) {
		const {Ball}= BallG;
		switch (type) {
		case ItemType.SpeedDown:
			BallG.#speedDownRate *= 0.9;
			break;
		case ItemType.Disruption:
			BallG.#setDisruption();
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
			const {x, y}= BallG.Ball.Pos;
			const angle = randFloat(270-140/2, 270+140/2) * PI/180;
			const v = vec2(cos(angle), sin(angle));
			BallSet.add(new Ball({x,y,v}));
		}
	}
	update() {
		if (!Game.isReadyScene && !Game.isPlayScene)
			return;
		if (!Paddle.Launched)
			return;
		BallSet.forEach(ball=> ball.update());
	}
	draw() {
		if (Scene.isClear || Scene.isGameOver)
			return;
		BallSet.forEach(ball=> ball.draw());
	}
	#cache(ctx, color, [offsetX=0,offsetY=0]=[], [scaleX=1,scaleY=1]=[]) {
		ctx.save();
		ctx.translate(Radius, Radius);
		ctx.scale(scaleX, scaleY);
		fillCircle(ctx)(offsetX, offsetY, Radius, color);
		ctx.restore();
	}
});
export class Ball extends Collider {
	Radius     = Radius;
	Width      = Radius * 2;
	Height     = Radius * 2;
	Pos        = vec2();
	Velocity   = vec2();
	InitSpeed  = (BallSpeed*BallG.initialSpeedRate) * BallG.stageSpeedRate;
	#speed     = this.InitSpeed;
	Accelerate = 0.02;
	constructor({x,y,v}) {
		super({x, y}, Radius);
		if (BallSet.size)
			this.#speed = BallG.Ball.speed;
		this.Pos.set(x, y);
		this.Velocity.set( v.normalized.mul(this.speed) );
		freeze(this);
	}
	get speed() {
		return this.#speed;
	}
	get isOnWall() {
		const {row,col}= this.tilePosFromCenter;
		for (let i=row+1; i<BrickG.Rows; i++)
			if (BrickG.MapData[i]?.[col]?.exists)
				return true;
		return false;
	}
	update() {
		if (Game.isReadyScene || Paddle.CatchX > 0)
			return;

		const Min = this.InitSpeed * 0.7;
		const Max = BallSpeed   * BallG.stageSpeedRate;
		const Spd = this.#speed * BallG.speedDownRate;

		this.#speed = clamp(this.speed+this.Accelerate, Min, Max);
		this.Pos.add( this.Velocity.normalized.mul(Spd) );

		if (this.#detectDropped())
			return;

		this.#reboundAtPaddle();
		this.#collisionWithArmy();
		this.#collisionWithBrick();
		Field.rebound(this);
	}
	#detectDropped() {
		if (this.Pos.y <= cvs.height || Scene.isClear)
			return false;

		if (Lives.left <= 0 && BallSet.size == 1) {
			Sound.stop();
			BallSet.clear();
			$trigger('Dropped');
			Scene.switchToGameOver();
			Scene.switchToReset(1500);
			return true;
		}
		if (Scene.isInDemo && BallSet.size == 1) {
			Scene.switchToReset();
			return true;
		}
		BallSet.delete(this);
		if (BallSet.size == 0) {
			Sound.stop();
			Scene.switchToDropped();
			Scene.switchToRespawn(1500);
			return true;
		}
	}
	#reboundAtPaddle() {
		if (!collisionRect(Paddle,this))
			return;

		Paddle.catch(this);
		this.Velocity.set( Paddle.ReboundVelocity.mul(this.speed) );
		Sound.play('se0');
		if (Paddle.CatchX)
			Ticker.Timer.set(200, _=> Sound.stop('se0'));
	}
	#collisionWithArmy() {
		const army = Army.detectCollided(this);
		if (army) {
			army.destroy();
			const v = this.Velocity.normalized;
			v.x *= randChoice(-1, 1);
			v.y *= randChoice(-1, 1);
			this.Velocity.set( v.mul(this.#speed*=ArmySpeedDown) );
		}
	}
	#collisionWithBrick() {
		const {Velocity:v,hitT,hitR,hitB,hitL}= this;
		const {x:vx,y:vy}= v;
		if (hitL) v.x = +abs(vx);
		if (hitR) v.x = -abs(vx);
		if (hitT) v.y = +abs(vy);
		if (hitB) v.y = -abs(vy);
		const brick = [hitL,hitR,hitB,hitT].find(BrickG.isBrick);
		if (brick) {
			brick.collision();
			if (brick.isImmortality) {
				if (v.x < 0) v.x += randFloat(0, -0.1);
				if (v.x > 0) v.x += randFloat(0, +0.1);
				if (abs(v.normalized.x) < 0.6) v.x *= 1.005;
			}
		}
	}
	draw() {
		ctx.save();
		ctx.globalAlpha = Paddle.alpha;
		ctx.translate(...vec2(this.Pos).sub(Radius).vals);
		ctx.drawImage($cvs, 0,0);
		ctx.restore();
	}
} freeze(Ball);
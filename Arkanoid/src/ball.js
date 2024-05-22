import {rgba}     from '../lib/color.js';
import {Sound}    from '../snd/sound.js';
import {Ticker}   from '../lib/timer.js';
import {cvs,ctx}  from './_canvas.js';
import {Game}     from './_main.js';
import {Field}    from './field.js';
import {Stages}   from './stage.js';
import {Lives}    from './lives.js';
import {Scene}    from './scene.js';
import {ItemType} from './item.js';
import {Army}     from './army.js';
import {BrickG}   from './brick.js';
import {Paddle}   from './paddle.js';

const cvsForBall    = document.createElement('canvas');
const ctxForBall    = cvsForBall.getContext('2d');
const Radius        = ceil(cvs.width / 80);
const BallSet       = new Set();
const BallSpeed     = cvs.height / 70;
const DisruptionMax = 10;
const SpeedRateMax  = 1.25;
const ItemSpeedDown = 0.70;
const ArmySpeedDown = 0.80;
cvsForBall.width    = Radius * 4;
cvsForBall.height   = Radius * 4;

const Grad = ctxForBall.createRadialGradient(0,0,0, 0,0,Radius);
      Grad.addColorStop(0.00, '#0099FF');
      Grad.addColorStop(0.70, '#55BBFF');
      Grad.addColorStop(0.98, '#55BBFF');
      Grad.addColorStop(1.00, '#FFFFFF');

const ShadowConfig = {
	color:  rgba(0,0,0,.4),
	offset: [Radius*3/4, Radius*2],
	scale:  [1, .7],
};

export const BallG = freeze(new class {
	static {
		$('load', _=> BallG.#setup());
	}
	#setup() {
		BallG.#cache(ctxForBall, ...values(ShadowConfig));
		BallG.#cache(ctxForBall, Grad);
		$on('GotItem', BallG.#onPowerUp);
	}
	#speedDownEnabeld = false;
	get speedDownEnabeld() {
		return BallG.#speedDownEnabeld;
	}
	get stageSpeedRate() {
		return 1+(((SpeedRateMax-1)/(Stages.length-1))*Game.stageIdx);
	}
	get initialSpeedRate() {
		return Game.stageNum <= 8 ? [6,6,7,7,8,8,9,9][Game.stageIdx]/10 : 1;
	}
	get ball() {
		return BallSet.values().next().value;
	}
	get count() {
		return BallSet.size;
	}
	init() {
		const x = cvs.width/2;
		const y = Paddle.Pos.y - Radius;
		const v = vec2(1, -1);
		if (!Game.respawned)
			BallG.#speedDownEnabeld = false;
		BallSet.clear();
		BallSet.add(new Ball({x,y,v}));
	}
	#onPowerUp(_, type) {
		switch (type) {
		case ItemType.SpeedDown:
			BallG.#speedDownEnabeld = true;
			break;
		case ItemType.Disruption:
			BallG.#setDisruption();
			break;
		case ItemType.Catch:
		case ItemType.Expand:
		case ItemType.Laser:
			const ball = BallG.ball;
			BallSet.clear();
			BallSet.add(ball);
		}
	}
	#setDisruption() {
		const {ball}= BallG;
		for (let i=0; i<DisruptionMax; i++) {
			const {x,y}= ball.Pos;
			const angle = randFloat(270-140/2, 270+140/2) * PI/180;
			const v = vec2(cos(angle), sin(angle));
			BallSet.add(new Ball({x,y,v}));
		}
	}
	update() {
		if (!Game.isReadyScene && !Game.isPlayScene)
			return;
		if (Scene.isInGame && !Paddle.launched)
			return;
		BallSet.forEach(ball=> ball.update());
	}
	draw() {
		if (Scene.isClear)
			return;
		BallSet.forEach(ball=> ball.draw());
	}
	#cache(ctx, color, [offsetX=0,offsetY=0]=[], [scaleX=1,scaleY=1]=[]) {
		ctx.save();
			ctx.translate(Radius, Radius);
			ctx.scale(scaleX, scaleY);
			ctx.beginPath();
				ctx.arc(offsetX, offsetY, Radius, 0,PI*2);
				ctx.fillStyle = color;
			ctx.fill();
		ctx.restore();
	}
});
const Ball = freeze(class extends BrickG.Collider {
	Radius     = Radius;
	Width      = Radius * 2;
	Height     = Radius * 2;
	Pos        = vec2(0, 0);
	Velocity   = vec2(0, 0);
	InitSpeed  = (BallSpeed*BallG.initialSpeedRate) * BallG.stageSpeedRate;
	#speed     = this.InitSpeed;
	Accelerate = 0.01;
	constructor({x,y,v}) {
		super({x, y}, Radius);
		if (BallSet.size)
			this.#speed = BallG.ball.speed;
		this.Pos.set(x, y);
		this.Velocity.set(v.normalized.mul(this.speed));
		freeze(this);
	}
	get speed() {
		return this.#speed;
	}
	update() {
		if (Game.isReadyScene || Paddle.catchX > 0)
			return;

		const SpeedMin = this.InitSpeed * ArmySpeedDown;
		const SpeedMax = BallSpeed * BallG.stageSpeedRate;
		const s = this.#speed * (BallG.speedDownEnabeld ? ItemSpeedDown : 1);
		const v = vec2(this.Velocity).normalized.mul(s);

		this.Pos.x  = clamp(this.Pos.x, Field.Left, Field.Right);
		this.Pos.y  = max(this.Pos.y, Field.Top);
		this.#speed = clamp(this.speed+this.Accelerate, SpeedMin, SpeedMax);
		this.Pos.add(v);

		if (this.#detectDroppedOffField())
			return;

		this.#reboundAtPaddle();
		this.#collisionWithArmy();
		this.#collisionWithBrickOrField();
	}
	#detectDroppedOffField() {
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
		if (Scene.isInDemo) {
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
	#setPaddleReboundVelocity() {
		const x = (this.Pos.x - Paddle.centerX) / (Paddle.Width/2);
		this.Velocity.x = clamp(x * 2, -1.5, 1.5);
		this.Velocity.y = -1;
		this.Velocity.set(this.Velocity.normalized.mul(this.speed));
	}
	#reboundAtPaddle() {
		if (!collisionRect(Paddle,this))
			return;
		Paddle.catch(this);
		this.#setPaddleReboundVelocity();
		Sound.play('se0');
		if (Paddle.catchX)
			Ticker.Timer.set(200, _=> Sound.stop('se0'));
	}
	#collisionWithArmy() {
		const army = Army.detectCollided(this);
		if (army) {
			army.destroy();
			const v = this.Velocity.normalized;
			const s = BallG.speedDownEnabeld ? 1 : ArmySpeedDown;
			v.x *= randChoice([-1,1]);
			v.y *= randChoice([-1,1]);
			this.Velocity.set(v.mul(this.#speed*=s));
		}
	}
	#collisionWithBrickOrField() {
		const {hitT,hitR,hitB,hitL}= this;
		if (hitL) this.Velocity.x = +abs(this.Velocity.x);
		if (hitR) this.Velocity.x = -abs(this.Velocity.x);
		if (hitB) this.Velocity.y = -abs(this.Velocity.y);
		if (hitT) this.Velocity.y = +abs(this.Velocity.y);

		for (const obj of [hitL,hitR,hitB,hitT])
			obj?.collision();

		if (hitT || hitR || hitB || hitL)
			this.Pos.add(randChoice([-1,1]));
	}
	draw() {
		ctx.save();
		ctx.globalAlpha = Paddle.alpha;
		ctx.translate(this.Pos.x-Radius, this.Pos.y-Radius);
		ctx.drawImage(cvsForBall, 0,0);
		ctx.restore();
	}
});
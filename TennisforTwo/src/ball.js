import {Timer}   from '../lib/timer.js';
import {Vec2}    from '../lib/vec2.js';
import {Sound}   from '../snd/sound.js';
import {cvs,ctx} from './canvas.js';
import {Scene}   from './scene.js';
import {Score}   from './score.js';
import {Color}   from './colors.js';
import {Player}  from './player.js';
import {Player1} from './player.js';
import {Com}     from './player.js';
import {Court}   from './court.js';
import {Pointer} from './pointer.js';

const Gravity  = 0.080;
const AirDrag  = 0.992;
const PosMax   = int(cvs.width /10.6);
const Radius   = int(cvs.height/60.0);
const PosList  = Array(PosMax);
const BallGrad = ctx.createRadialGradient(0,0,0,0,0,Radius);

BallGrad.addColorStop(0.0, 'rgba(204 255 255 /1.0)');
BallGrad.addColorStop(0.2, 'rgba(204 255 255 /1.0)');
BallGrad.addColorStop(0.4, 'rgba(102 255 255 /0.9)');
BallGrad.addColorStop(1.0, 'rgba(  0 255 255 /0.0)');

export const Ball = freeze(new class {
	static {$ready(this.#setup)}
	static #setup() {
		$on({'Title Serve':Ball.#reset});
		$(Player).on({shot:Ball.#resetBoundCnt});
	}
	#boundCnt = 0;
	Radius    = Radius;
	Velocity  = Vec2();
	get boundCnt() {return this.#boundCnt}
	get Pos()      {return PosList[0] ||= Vec2()}
	get xPct()     {return abs(((Ball.Pos.x/cvs.width)-.5)*2 * 100)}
	get yPctOfBetweenNetToTop() {
		return (1-(Ball.Pos.y/Court.NetTopY)) * 100;
	}
	get Side() {
		return Ball.Pos.x < cvs.width/2
			? Player.Side.One
			: Player.Side.Two;
	}
	get canShotWithCom() {
		if (Score.waiting || Timer.has(Ball)) return false;
		const {current,Side}= Player;
		return Scene.isTitle
			&& !Player1.shotAlready
			&& current   == Side.Two
			&& Ball.Side == Side.One
			|| !Com.shotAlready
			&& current   == Side.One
			&& Ball.Side == Side.Two
	}
	#reset() {
		PosList[0] = Vec2();
		for (let i=0; i<PosMax; i++)
			PosList[i] = PosList[0];
	}
	#resetBoundCnt() {
		Ball.#boundCnt = 0;
	}
	update() {
		if (Player.serving) return;
		for (let i=PosMax-1; i>0; i--)
			PosList[i] = Vec2(PosList[i-1]);

		const lastPos = Vec2(Ball.Pos);
		const {Pos,xPct,Velocity:v,boundCnt}= Ball;
		const {receiver,current,nextTurn}= Player

		v.y += Gravity;
		if (Player.receiver >= 0)
			v.y += Gravity*4;
		v.mul(AirDrag);
		Pos.add(v);

		if (Pos.y < 0) {
			Pos.y = 0;
			v.y *= -0.3;
		}
		if (v.x < 0 && Pos.x < Radius
		 || v.x > 0 && Pos.x > cvs.width-Radius) {
			Pos.x = lastPos.x;
			v.x *= -0.55;
			Score.scored(boundCnt == 0 ? current^1 : current);
			return;
		}
		if (Court.intersectNet(lastPos, Pos)) {
			Ball.#collidedWithNet(current, v);
			return;
		}
		if (Pos.y > Court.GroundY-Radius)
			if (Ball.#droppedToGround(current))
				return;

		if (Ball.canShotWithCom) {
			if (Ball.yPctOfBetweenNetToTop >= Com.HeightLimit)
				return;
			if (abs(Com.Pointer.Items[nextTurn].xPct - xPct) > abs(v.x))
				return;
			switch(boundCnt) {
			case 0:
				if (receiver == nextTurn) return;
				Com.smashOrDrop();
				Com.volley();
				break;
			case 1:
				Com.stroke();
				Com.groundSmash();
				break;
			}
		}
	}
	#collidedWithNet(current, v) {
		if (Ball.Pos.y <= Court.NetTopY+Radius*2) {
			v.mul(.3);
			Sound.play('netIn');
			if (current == (Player.receiver^1))
				Timer.set(1000, ()=> Player.setServe(current), {id:Ball});
			return;
		}
		Ball.Pos.x = cvs.width/2 - sign(v.x) * abs(v.x);
		v.x *= -0.5;
		Score.scored(current^1);
	}
	#droppedToGround(current) {
		Ball.Pos.y = Court.GroundY - Radius;
		Ball.Velocity.y *= -1.5;
		if (Ball.Side == current) {
			Score.scored(current^1);
			return false;
		}
		switch(Ball.boundCnt) {
		case 0:
			Ball.#boundCnt++;
			Scene.isInGame && Sound.play('bound');
			return false;
		case 1:
			Ball.#boundCnt++;
			Score.scored(current);
			return true;
		}
	}
	#drawAfterImages() {
	 	ctx.save();
		ctx.lineWidth = Radius/2;
		for (let i=1; i<PosMax; i++) {
			const alpha = ((PosMax-i)/PosMax) * .8;
			ctx.strokeStyle =`rgba(${Color.Cyan} /${alpha})`;
			ctx.beginPath();
			ctx.quadraticCurveTo(...PosList[i].vals, ...PosList[i-1].vals);
			ctx.stroke();
		}
		ctx.restore();
	}
	draw() {
		this.#drawAfterImages();
	 	ctx.save();
		ctx.translate(...Ball.Pos.vals);
		ctx.scale(1.3, 1.3);
		fillCircle(ctx)(0,0, Radius, BallGrad);
		ctx.restore();
	}
});
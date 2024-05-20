import {Sound}      from '../snd/sound.js';
import {cvs,ctx}    from './_canvas.js';
import {Scene}      from './scene.js';
import {AfterImage} from './afterImage.js';
import {Player}     from './player.js';

export const Ball = freeze(new class extends AfterImage {
	constructor() {
		const Radius = 8;
		super(new class {
			PosMax    = 60;
			gAlpha    = 0.6;
			LineWidth = Radius * 1.5;
			LineTaper = this.LineWidth * 0.5;
		});
		this.Speed  = 8.5;
		this.Radius = Radius;
		this.Velocity = vec2();
	}
	get isLeftSide()  {return Ball.Pos.x < cvs.width /2}
	get isUpperSide() {return Ball.Pos.y < cvs.height/2}
	get backPos()     {return vec2(Ball.Pos).sub(Ball.Velocity)}
	get forwardPos()  {return vec2(Ball.Pos).add(Ball.Velocity)}
	reset() {
		super.reset();
		Ball.Positions[0] = vec2(
			cvs.width  / 2,
			cvs.height / 2
		);
		Ball.Velocity.set(Ball.Velocity.normalized)
		Scene.isInGame
			? Ball.Velocity.set(1, randFloat(-0.5,0.5)).mul(Ball.Speed)
			: Ball.Velocity.set(1,1).mul(Ball.Speed*3/4);
		if (randInt(0,1))
			Ball.Velocity.x *= -1;
	}
	respawn() {
		Ball.Positions.splice(1);
		Ball.Pos.x = cvs.width / 2;
		Ball.Velocity.set(Ball.Velocity.normalized).mul(Ball.Speed);
		const angle = Vec2.angle(Ball.Pos, Vec2.add(Ball.Pos, Ball.Velocity));
		const maxAngle = 45 * PI/180;
		if (abs(angle) >= maxAngle) {
			const m = Ball.Velocity.magnitude;
			const x = m*sign(Ball.Velocity.x);
			const y = m*sin(maxAngle-PI/2);
			Ball.Velocity.set(x, y);
		}
	}
	update() {
		super.update();
		const {Radius:r,Pos,Velocity}= Ball;
		Ball.Velocity.y = min(Ball.Velocity.y, Ball.Speed*1.4);
		this.Pos.add(Velocity);
		if (Scene.isDemo)
			if (Pos.x-r < 0 || Pos.x+r > cvs.width) {
				Pos.x = Ball.isLeftSide ?  r : cvs.width-r;
				Velocity.x *= -1;
			}
		if (Pos.y-r <= 0 || Pos.y+r >= cvs.height) {
			Pos.y = Ball.isUpperSide ? r : cvs.height-r;
			Velocity.y *= -1;
			Sound.play('se2');
		}
	}
	draw() {
		super.draw();
		ctx.save();
		ctx.translate(...Ball.Pos.vals);
		ctx.beginPath();
		ctx.arc(0,0, Ball.Radius, 0, PI*2);
		ctx.fill();
		ctx.restore();
	}
});

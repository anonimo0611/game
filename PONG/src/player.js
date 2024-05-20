import {Sound}      from '../snd/sound.js';
import {cvs,ctx}    from './_canvas.js';
import {Pointer}    from './ctrl.js';
import {Ball}       from './ball.js';
import {AfterImage} from './afterImage.js';

export const PlayerSide   = freeze({One:0,Two:1, Max:2});
export const Players      = Array(PlayerSide.Max);
export const PaddleHeight = cvs.height / 6;

const OffsetX   = 32;
const LineWidth = 10;

export class Player extends AfterImage {
	static reset() {
		Players[0] = new Player1;
		Players[1] = new Com;
	}
	constructor() {
		super({PosMax:20, gAlpha:.5, LineWidth});
	}
	Positions = Array(this.PosMax);
	Velocity  = vec2();
	get Pos()   {return this.Positions[0]}
	get isOne() {return this == Players[PlayerSide.One]}
	get isTwo() {return this == Players[PlayerSide.Two]}
	get MiddleY() {
		return this.Pos.y + (PaddleHeight / 2);
	}
	get checkIntersectWithBall() {
		const {cross,sub}= Vec2;
		const [v0st,v0ed]= [Ball.backPos,Ball.forwardPos];
		const [v1st,v1ed]= [this.Pos,vec2(this.Pos).add(0,PaddleHeight)];
		const [v0es,v1es]= [sub(v0ed,v0st),sub(v1ed,v1st)];
		return (
		cross(v0es,sub(v1st,v0ed)) * cross(v0es,sub(v1ed,v0ed)) < 0.000001 &&
		cross(v1es,sub(v0st,v1st)) * cross(v1es,sub(v0ed,v1st)) < 0.000001);
	}
	update() {
		super.update();
		this.Pos.y = clamp(this.Pos.y, 0, cvs.height - PaddleHeight);
		if (this.checkIntersectWithBall) {
			if (this.isOne && Ball.Velocity.x > 0
			 || this.isTwo && Ball.Velocity.x < 0)
				return;
			Ball.Velocity.y = (Ball.Pos.y - this.MiddleY) / (PaddleHeight/2) * 2;
			Ball.Velocity.x = -sign(Ball.Velocity.x);
			Ball.Velocity.mul(Ball.Speed);
			Sound.play('se1');
		}
	}
	draw() {
		super.draw();
		const lw = 10;
		ctx.save();
		ctx.translate(...this.Pos.valsAsInt);
		{ // Vertical bar
			ctx.beginPath();
			ctx.moveTo(0,0);
			ctx.lineTo(0,PaddleHeight);
			ctx.lineWidth = LineWidth;
			ctx.stroke();
		}
		{ // Center line
			ctx.beginPath();
			ctx.moveTo(-lw, PaddleHeight/2);
			ctx.lineTo(+lw, PaddleHeight/2);
			ctx.lineWidth = 2;
			ctx.stroke();
		}
		ctx.restore();
	}
}
class Player1 extends Player {
	constructor(){
		super();
		this.Positions[0] = vec2(
			 cvs.width / OffsetX,
			(cvs.height - PaddleHeight) / 2
		);
		freeze(this);
	}
	update() {
		this.Pos.y = Pointer.y - (PaddleHeight / 2);
		super.update();
	}
}
class Com extends Player {
	static get Speed() {
		return Ball.Speed * 1.17;
	}
	constructor(){
		super();
		this.Positions[0] = vec2(
			cvs.width - (cvs.width / OffsetX),
			(cvs.height - PaddleHeight) / 2
		);
		freeze(this);
	}
	update() {
		const {Speed} = Com;
		for (let i=0; i<10; i++) {
			if (Ball.Pos.y < this.MiddleY-Speed) this.Pos.y -= Speed/10;
			if (Ball.Pos.y > this.MiddleY+Speed) this.Pos.y += Speed/10;
		}
		super.update();
	}
}
freeze(Player);
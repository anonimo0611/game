import {Ticker}   from '../lib/timer.js';
import {rgba}     from '../lib/color.js';
import {cvs,ctx}  from './_canvas.js';
import {Game}     from './_main.js';
import {Field}    from './field.js';
import {Paddle}   from './paddle.js';
import {BallMgr}  from './ball.js';
import {BrickMgr} from './brick.js';
import {Army}     from './army.js';

const {ColWidth,RowHeight}= Field;

export const Sight = freeze(new class {
	Pos    = vec2();
	#brick = null;
	get brick() {
		return this.#brick;
	}
	get enabled() {
		return BallMgr.count > 0 && Paddle.CatchEnabled
			&& (!BallMgr.Ball.launched || Paddle.CatchX > 0);
	}
	get canDraw() {
		return (this.enabled && (Game.isDemoScene || Paddle.controllable));
	}
	get BallVelocity() {
		return !BallMgr.Ball.launched
			? Paddle.LaunchVelocity
			: Paddle.ReboundVelocity;
	}
	get BallVector() {
		return Vec2.add(
			Paddle.CaughtBallPos,
			this.BallVelocity.clone.mul(Field.Diagonal)
		);
	}
	#detectBrick(brick) {
		const positions = [[0,1,1,1], [0,0,0,1], [1,0,1,1]].map(ov=>
			getIntersection(
				Paddle.CaughtBallPos, this.BallVector,
				vec2(brick.Pos).add(ColWidth*ov[0], RowHeight*ov[1]),
				vec2(brick.Pos).add(ColWidth*ov[2], RowHeight*ov[3])
			)
		);
		const [bottom,left,right]= positions;
		const pos = bottom || left || right;
		if (pos) {
			this.#brick = brick;
			this.Pos.set(pos)
		}
		return positions;
	}
	#attackArmy(point) {
		for (const army of Army.ArmySet) {
			if (army.contains(point)) {
				army.takeDamage(1);
				this.Pos.set(point);
				return true;
			}
		}
		return false;
	}
	#detectIntersectionsWithArmyOrBrick() {
		this.#brick = null;
		for (const brick of BrickMgr.MapData.flat().reverse()) {
			const [b,l,r]= this.#detectBrick(brick);
			if (b || l || r) {
				if (brick.isNone) {
					if (this.#attackArmy(b || l || r))
						return true;
					continue;
				}
				!b && l && brick.AdjL?.exists && this.#detectBrick(brick.AdjL);
				 b && l && brick.AdjR?.exists && this.#detectBrick(brick.AdjR);
				return true;
			}
		}
		return false;
	}
	update() {
		if (!this.enabled)
			return;

		if (!this.#detectIntersectionsWithArmyOrBrick())
			this.Pos.set(this.BallVector);

		if (this.brick.isNone)
			this.#brick = null;
	}
	drawLine() {
		if (!this.canDraw)
			return;
		ctx.save();
		ctx.lineCap     = 'square';
		ctx.lineWidth   = BallMgr.Radius*2;
		ctx.strokeStyle = rgba(0,225,0, 0.5);
		drawLine(ctx)(
			...Paddle.CaughtBallPos.vals,
			...this.Pos.vals
		);
		ctx.restore();
	}
	drawTarget() {
		if (!this.canDraw || !this.brick)
			return;
		ctx.save();
		ctx.lineWidth   = cvs.width/150;
		ctx.strokeStyle = '#9FC';
		ctx.strokeRect(...this.brick.Pos.vals, ColWidth, RowHeight)
		ctx.restore();
	}
});
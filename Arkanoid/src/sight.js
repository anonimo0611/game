import {Vec2}     from '../lib/vec2.js';
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
	Pos    = Vec2();
	#brick = null;
	get brick() {
		return this.#brick;
	}
	get enabled() {
		return BallMgr.count > 0 && Paddle.CatchEnabled
			&& (!BallMgr.Ball.launched || Paddle.catchX > 0);
	}
	get canDraw() {
		return this.enabled && (Game.isDemoScene || Paddle.controllable);
	}
	get BallVelocity() {
		return !BallMgr.Ball.launched
			? Paddle.LaunchVelocity
			: Paddle.BounceVelocity;
	}
	get BallVector() {
		return Vec2.add(
			Paddle.CaughtBallPos,
			this.BallVelocity.clone.mul(Field.Diagonal)
		);
	}
	get #intersectionWithField() {
		return this.#getIntersection(
			Vec2(0, Field.Top),
			Vec2(cvs.width, Field.Top)
		) ?? this.BallVector;
	}
	#getIntersection(v2St, v2Ed) {
		return Vec2.getIntersection(
			Paddle.CaughtBallPos, this.BallVector, v2St, v2Ed);
	}
	#attackArmy(point) {
		for (const army of Army.ArmySet) {
			if (army.contains(point)) {
				army.crash(1);
				this.Pos.set(point);
				return true;
			}
		} return false;
	}
	#detectBrick(brick) {
		const positions = [[0,1,1,1], [0,0,0,1], [1,0,1,1]].map(ov=>
			this.#getIntersection(
				Vec2(brick.Pos).add(ColWidth*ov[0], RowHeight*ov[1]),
				Vec2(brick.Pos).add(ColWidth*ov[2], RowHeight*ov[3])
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
	#intersectionsWithArmyOrBrick() {
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

		if (!this.#intersectionsWithArmyOrBrick())
			this.Pos.set(this.#intersectionWithField);

		if (this.brick.isNone)
			this.#brick = null;
	}
	drawLine() {
		if (!this.canDraw)
			return;

		drawLine(ctx, {
			cap:  'square',
			color: rgba(0,225,0, 0.5),
			width: BallMgr.Radius*2,
		})(
			...Paddle.CaughtBallPos.vals,
			...this.Pos.vals
		);
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
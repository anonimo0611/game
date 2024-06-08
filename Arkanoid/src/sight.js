import {Ticker}  from '../lib/timer.js';
import {rgba}     from '../lib/color.js';
import {cvs,ctx}  from './_canvas.js';
import {Field}    from './field.js';
import {Paddle}   from './paddle.js';
import {BallG}    from './ball.js';
import {BrickG}   from './brick.js';

const {ColWidth,RowHeight}= Field;

export const Sight = new class {
	Pos    = vec2();
	#brick = null;
	get brick() {
		return this.#brick;
	}
	get BallV() {
		const v = Paddle.ReboundVelocity.mul(Field.Diagonal);
		return Vec2.add(Paddle.CaughtBallPos, v);
	}
	#detect(brick) {
		const positions = [[0,1,1,1], [0,0,0,1], [1,0,1,1]].map(ov=> 
			getIntersection(
				Paddle.CaughtBallPos, this.BallV,
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
	#detectIntersectionsWithBricks() {
		this.#brick = null;
		for (const brick of BrickG.MapData.flat().reverse()) {
			if (brick.isNone) continue;
			const [b,l,r]= this.#detect(brick);
			if (b || l || r) {
				!b && l && brick.AdjL?.exists && this.#detect(brick.AdjL);
				 b && l && brick.AdjR?.exists && this.#detect(brick.AdjR);
				return true;
			}
		}
		return false;
	}
	#detectIntersectionsWithFields() {
		for (const pos of Field.Segments) {
			const endPos = getIntersection(pos[0],pos[1],
				Paddle.CaughtBallPos, this.BallV);
			if (endPos) return this.Pos.set(endPos);
		}
	}
	update() {
		if (!Paddle.CatchX) return false;
		  !this.#detectIntersectionsWithBricks()
		&& this.#detectIntersectionsWithFields();
	}
	draw() {
		if (!Paddle.CatchX) return;
		drawLine(ctx, {color:rgba(0,225,0, 0.7),width:cvs.width/150})(
			...Paddle.CaughtBallPos.vals,
			...this.Pos.vals
		);
		if (this.brick) {
			ctx.save();
			ctx.lineWidth   = cvs.width/150;
			ctx.strokeStyle = '#99FFCC';
			ctx.strokeRect(...this.brick.Pos.vals, ColWidth, RowHeight)
			ctx.restore();
		}
	}
};
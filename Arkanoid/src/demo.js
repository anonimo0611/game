import {cvs,ctx}  from './_canvas.js';
import {Scene}    from './scene.js';
import {Field}    from './field.js';
import {BallG}    from './ball.js';
import {BrickG}   from './brick.js';
import {Paddle}   from './paddle.js';
import {Item}     from './item.js';
import {ItemType} from './item.js';

const {Type,Cols,Rows,ColWidth,RowHeight}= BrickG;

let $shakeAngle = 0;
let $target     = null;
let $landingPos = null;

export const Demo = new class {
	get ballPos()      {return BallG.NearlyBall.Pos}
	get ballVelocity() {return BallG.NearlyBall.Velocity}
	get canShootBricksWithLaser() {
		const data = BrickG.MapData.flat().reverse();
		for (const {destroyed,type,x,Width:w} of data) {
			if (type == Type.None || destroyed) continue;
			if (x   >= Paddle.CenterX-ColWidth*2
			 && x+w <= Paddle.CenterX+ColWidth*2)
				return type != Type.Immortality;
		} return false;
	}
	#getBrickTarget() {
		const data = BrickG.MapData.flat().reverse()
		.filter(({type,row,col,destroyed})=> {
			if (destroyed
				|| type == Type.None
				|| type == Type.Immortality
			 ) return false;
			for (let i=row+1; i<Rows-row; i++) {
				const brick = BrickG.MapData[i][col];
				if (brick.type == Type.Immortality)
					return false;
				if (!brick.destroyed
					&& brick.type != Type.None
				) return false;
			} return true;
		}); return data.length ? data : null;
	}
	update() {
		if (!Scene.isInDemo) return;
		$shakeAngle += PI/94 + randFloat(-0.01, +0.01);
		this.#setBrickTarget();
		this.#setLandingPointOfBall();
	}
	autoPlay() {
		const mag = this.ballVelocity.magnitude;
		if (this.#paddleToItem(Item.Current))
			return;
		if ($landingPos && $target?.Pos) 
			return void this.#aimingAtTargetBrick(mag);

		this.#paddleToBall(mag);
	}
	#moveTo(dstX, mag, step) {
		for (let i=0; i<step; i++) {
			if (dstX < Paddle.CenterX) Paddle.Pos.x -= mag/step;
			if (dstX > Paddle.CenterX) Paddle.Pos.x += mag/step;
		}		
	}
	#paddleToBall(mag) {
		const x = this.ballPos.x * (sin($shakeAngle)/10+1);
		this.#moveTo(x, mag, 45);
	}
	#paddleToItem(item) {
		if (!item || this.ballVelocity.y > 0)
			return false;
		if (Paddle.LaserEnabeld && item.Type == ItemType.Expand)
			return false;
		this.#moveTo(item.CenterX, 15, 45);
		return true;
	}
	#aimingAtTargetBrick(mag) {
		const {ReboundAngleMax:aMax,Width:w}= Paddle;
		const aimAngle = Vec2.angle($target?.Pos, $landingPos) + PI/2;
		const position = $landingPos.x - w * norm(-aMax*2, +aMax*2, aimAngle);
		this.#moveTo(position + w/2, mag, 45);
	}
	#setLandingPointOfBall() {
		const mag = sqrt(cvs.height**2 + cvs.width**2);
		$landingPos = getIntersection(
			vec2(Field.Left,  Paddle.Pos.y),
			vec2(Field.Right, Paddle.Pos.y),
			this.ballPos,
			Vec2.add(this.ballPos, this.ballVelocity.normalized.mul(mag))
		);
	}
	#setBrickTarget() {
		if (!BrickG.exsists($target ?? {})) {
			const data = this.#getBrickTarget();
			if (!data || data.length >= 10) {
				$target = null;
				return;
			}
			const target = randChoice(data);
			const {Pos,col,row}= target;
			$target = {col,row,Pos:vec2(Pos).add(ColWidth/2, RowHeight/2)};
		}
	}
	#drawPoint(pos, r, color) {
		fillCircle  (ctx)(...pos.vals, r, color);
		strokeCircle(ctx)(...pos.vals, r, 3, '#FFF');
	}
	draw() {
		return;
		if ($target)
			this.#drawPoint($target.Pos, 10, '#F33');
		if ($landingPos)
			this.#drawPoint($landingPos, 10, '#F33');
	}
}
$on('Reset Start', function() {
	$shakeAngle = 0;
	$target     = null;
	$landingPos = null;
});
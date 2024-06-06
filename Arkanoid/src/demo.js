import {Ticker}   from '../lib/timer.js';
import {Timer}    from '../lib/timer.js';
import {cvs,ctx}  from './_canvas.js';
import {Game}     from './_main.js';
import {Scene}    from './scene.js';
import {Field}    from './field.js';
import {BallG}    from './ball.js';
import {BrickG}   from './brick.js';
import {Paddle}   from './paddle.js';
import {Item}     from './item.js';
import {ItemType} from './item.js';

const {Type,Cols,Rows,ColWidth,RowHeight}= BrickG;
const isImmo    = b=> b.type == Type.Immortality;
const isEmpty   = b=> b.type == Type.None || b.destroyed;
const {Diagonal}= Field;
let $shakeAngle = 0;
let $target     = null;
let $landingPos = null;

function moveTo(dstX, mag, step) {
	for (let i=0; i<step; i++) {
		if (dstX < Paddle.CenterX) Paddle.Pos.x -= mag/step;
		if (dstX > Paddle.CenterX) Paddle.Pos.x += mag/step;
	}		
}
export const Demo = new class {
	get Ball()         {return BallG.NearlyBall}
	get BallPos()      {return this.Ball.Pos}
	get BallVelocity() {return this.Ball.Velocity}
	get canShootBricksWithLaser() {
		const data = BrickG.MapData.flat().reverse();
		for (const {destroyed,type,x,Width:w} of data) {
			if (type == Type.None || destroyed) continue;
			if (x   >= Paddle.CenterX-ColWidth*2
			 && x+w <= Paddle.CenterX+ColWidth*2)
				return type != Type.Immortality;
		} return false;
	}
	getBrickTargets() {
		return BrickG.MapData.flat().reverse().filter(b=> {
			if (isEmpty(b) || isImmo(b))
				return false;
			for (let i=b.row+1, col=b.col; i<Rows-b.row; i++) {
				const b = BrickG.MapData[i][col];
				if (!isEmpty(b) || isImmo(b))
					return false;
			} return true;
		});
	}
	getEmptiesBetweenImmoWalls() {
		for (let i=BrickG.MapData.length-1; i>=0; i--) {
			const row = BrickG.MapData[i];
			if (row.some(isImmo))
				return row.filter(isEmpty);
		}
	}
	update() {
		if (!Scene.isInDemo) return;
		$shakeAngle += PI/94 + randFloat(-0.01, +0.01);
		this.#setTarget();
		this.#setLandingPointOfBall();
	}
	autoPlay() {
		const mag = this.BallVelocity.magnitude;
		if (this.#paddleToItem(Item.Current))
			return;
		if (Paddle.CatchEnabeld) {
			Paddle.CatchX
				? CatchMode.autoPlay()
				: this.#paddleToBall(mag);
			return;
		}	
		if ($landingPos && $target?.Pos) {
			this.#aimingAtTargetBrick(mag*0.8);
			return;
		}
		this.#paddleToBall(mag);
	}
	#paddleToBall(mag) {
		const x = this.BallPos.x * (sin($shakeAngle)/10+1);
		moveTo(x, mag*1.2, 45);
	}
	#paddleToItem(item) {
		if (!item || this.BallVelocity.y > 0) return false;
		const {Type}= item;
		const targetLen = this.getBrickTargets().length;
		if (Paddle.CatchEnabeld && Type == ItemType.Expand) return false;
		if (Paddle.LaserEnabeld && Type == ItemType.Expand) return false;
		if (targetLen == 0 && Type == ItemType.Laser) return false;
		moveTo(item.CenterX, 18, 45);
		return true;
	}
	#aimingAtTargetBrick(mag) {
		const {ReboundAngleMax:aMax,Width:w}= Paddle;
		const angle = Vec2.angle($target?.Pos, $landingPos) + PI/2;
		const pos = $landingPos.x - w * norm(-aMax*2, +aMax*2, angle);
		moveTo(pos + w/2, mag, 45);
	}
	#setLandingPointOfBall() {
		$landingPos = getIntersection(
			vec2(Field.Left,  Paddle.Pos.y),
			vec2(Field.Right, Paddle.Pos.y),
			this.BallPos,
			Vec2.add(
				this.BallPos,
				this.BallVelocity.normalized.mul(Diagonal)
			)
		);
	}
	#setTarget() {
		if (!BrickG.exsists($target ?? {})) {
			const data = this.getBrickTargets();
			if (data.length == 0)
				return void this.#setEmptyTarget();
			if (Game.stageNum == 11 || BrickG.remains <= 15) {
				const target = randChoice(data);
				const {Pos:pos,col,row}= target;
				const Pos = vec2(pos).add(ColWidth/2, RowHeight/2);
				$target = {col,row,Pos};
			}
		}
	}
	#setEmptyTarget() {
		if (Ticker.count % 120 != 0) return;
		const target = this.getEmptiesBetweenImmoWalls();
		const {Pos,col,row}= randChoice(target);
		$target = {col,row,Pos:vec2(Pos).add(
			randFloat(0, ColWidth),
			randFloat(0, RowHeight)
		)};
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
const CatchMode = new class {
	static {
		$on({CaughtBall: _=> CatchMode.#onCaught()});
	}
	#dir    = 1;
	#vector = vec2();
	#aiming = false;

	#onCaught() {
		if (Scene.isInDemo)
		Timer.cancel(CatchMode).set(1500, this.#release, {id:CatchMode});
	}
	#release() {
		CatchMode.#dir = 1;
		CatchMode.#aiming = false;
		$trigger('ReleaseBall');
	}
	autoPlay() {
		this.#vector  = Demo.Ball.paddleReboundVelocity.mul(Diagonal);
		const bricks  = Demo.getBrickTargets();
		const targets = bricks.length > 0
			? bricks
			: Demo.getEmptiesBetweenImmoWalls();

		const offsetX = bricks.length? 0 : Demo.Ball.Radius*2;
		for (const brick of targets)
			if (isIntersectionBetween2Points(
				Demo.BallPos,
				vec2(Demo.BallPos).add(this.#vector),
				vec2(brick.Pos).add(0+offsetX, RowHeight),
				vec2(brick.Pos).add(ColWidth-offsetX, RowHeight)
			)) {
				this.#aiming = true;
			 	Timer.cancel(CatchMode);
			 	Timer.set(50, this.#release)
			}
		this.#move();
	}
	#move() {
		if (this.#aiming) return;
		const mag = Field.Width/60, step = 20;
		if (this.#dir > 0) {
			moveTo(Field.Right, mag, step);
			if (Paddle.Pos.x > Paddle.MoveMax)
				this.#dir *= -1;
		}
		if (this.#dir < 0) {
			moveTo(Field.Left, mag, step);
			if (Paddle.Pos.x < Paddle.MoveMin)
				this.#dir *= -1;
		}
	}
};

$on('Reset Start', function() {
	Timer.cancel(CatchMode);
	$shakeAngle = 0;
	$target     = null;
	$landingPos = null;
});
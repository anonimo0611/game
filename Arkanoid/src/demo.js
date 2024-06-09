import {Ticker}   from '../lib/timer.js';
import {Timer}    from '../lib/timer.js';
import {cvs,ctx}  from './_canvas.js';
import {Game}     from './_main.js';
import {Scene}    from './scene.js';
import {Field}    from './field.js';
import {BallG}    from './ball.js';
import {BrickG}   from './brick.js';
import {Paddle}   from './paddle.js';
import {Sight}    from './sight.js';
import {Army}     from './army.js';
import {Item}     from './item.js';
import {ItemType} from './item.js';

const {Type,Cols,Rows,ColWidth,RowHeight}= BrickG;
const AlwaysAimingStageSet = new Set([5,11]);

let $shakeAngle = 0;
let $target     = null;
let $landingPos = null;

export const Demo = new class {
	get Ball() {return BallG.NearlyBall}
	get canShoot() {
		return (
			this.#canShootBricksWithLaser ||
			this.#canShootArmyWithLaser);
	}
	get #canShootBricksWithLaser() {
		const data = BrickG.MapData.flat().reverse();
		for (const {isNone,type,x,Width:w} of data) {
			if (isNone) continue;
			if (x  >= Paddle.CenterX-ColWidth*2
			&& x+w <= Paddle.CenterX+ColWidth*2)
				return type != Type.Immortality;
		} return false;
	}
	get #canShootArmyWithLaser() {
		for (const {Pos,Width:w,tilePosFromCenter} of Army.ArmySet) {
			if (Pos.x   >= Paddle.CenterX-w
			 && Pos.x+w <= Paddle.CenterX+w) {
				const {row,col}= tilePosFromCenter;
				for (let i=row+1; i<Rows; i++)
					if (BrickG.MapData[i]?.[col]?.exists)
						return false;
				return true;
			}
		} return false;
	}
	getBrickTargets() {
		return BrickG.MapData.flat().reverse().filter(b=> {
			if (b.isNone || b.isImmortality) return false;
			for (let i=b.row+1, col=b.col; i<Rows-b.row; i++) {
				const b = BrickG.MapData[i][col];
				if (!b.isNone || b.isImmortality) return false;
			} return true;
		});
	}
	getEmptiesBetweenImmoWalls() {
		for (let i=BrickG.MapData.length-1; i>=0; i--) {
			const row = BrickG.MapData[i];
			if (row.some(b=> b.isImmortality))
				return row.filter(b=> b.isNone);
		}
	}
	update() {
		if (!Scene.isInDemo) return;
		$shakeAngle += PI/94 + randFloat(-0.01, +0.01);
		this.#setTarget();
		this.#setLandingPointOfBall();
	}
	autoPlay() {
		const mag = this.Ball.Velocity.magnitude;
		if (this.#paddleToItem(Item.Current))
			return;
		if (Paddle.CatchEnabeld) {
			Paddle.CatchX
				? CatchMode.autoPlay()
				: this.#paddleToBall(mag);
			return;
		}	
		if ($landingPos && $target?.Pos) {
			this.#aimingAtTargetBrick(mag);
			return;
		}
		this.#paddleToBall(mag);
	}
	#paddleToBall(mag) {
		const x = this.Ball.Pos.x * (sin($shakeAngle)/10+1);
		moveTo(x, mag*1.2, 45);
	}
	#paddleToItem(item) {
		const {Type} = item;
		const BallV  = this.Ball.Velocity;
		const trgLen = this.getBrickTargets().length;
		if (!item || !this.Ball.isOnWall && BallV > 0)      return false;
		if (Paddle.CatchEnabeld && Type == ItemType.Expand) return false;
		if (Paddle.LaserEnabeld && Type == ItemType.Expand) return false;
		moveTo(item.CenterX, 18, 45);
		return true;
	}
	#aimingAtTargetBrick(mag) {
		const {ReboundAngleMax:aMax,Width:w}= Paddle;
		const angle = Vec2.angle($target?.Pos, $landingPos) + PI/2;
		const pos = $landingPos.x - w * norm(-aMax*2, +aMax*2, angle);
		if ($target.type.isNone)
			pos.x += randFloat(-w*0.5, w*0.5); 
		moveTo(pos + w/2, mag, 60);
	}
	#setLandingPointOfBall() {
		$landingPos = getIntersection(
			vec2(Field.Left,  Paddle.Pos.y),
			vec2(Field.Right, Paddle.Pos.y),
			this.Ball.Pos,
			Vec2.add(
				this.Ball.Pos,
				this.Ball.Velocity.normalized.mul(Field.Diagonal)
			)
		);
	}
	#setTarget() {
		if (!BrickG.isBreakable($target ?? {})) {
			const targets = this.getBrickTargets();
			if (targets.length == 0)
				return void this.#setEmptyTarget();
			if (AlwaysAimingStageSet.has(Game.stageNum)
			 || BrickG.remains <= 15) {
				const target = randChoice(targets);
				const {Pos:pos,col,row,type}= target;
				const Pos = vec2(pos).add(ColWidth/2, RowHeight/2);
				$target = {col,row,Pos,type};
			}
		}
	}
	#setEmptyTarget() {
		if (Ticker.count % 120 != 0) return;
		const target = this.getEmptiesBetweenImmoWalls();
		const {Pos,col,row,type}= randChoice(target);
		$target = {col,row,type,Pos:vec2(Pos).add(
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
		if (!Scene.isInDemo) return;
		Timer.cancel(CatchMode).set(1500, this.#release, {id:CatchMode});
	}
	#release() {
		CatchMode.#dir = 1;
		CatchMode.#aiming = false;
		Timer.cancel(CatchMode);
		$trigger('ReleaseBall');
	}
	#releaseTimer() {
		this.#aiming = true;
	 	Timer.cancel(CatchMode).set(200, this.#release)
	}
	autoPlay() {
		const Radius = BallG.Radius;
		const bricks = Demo.getBrickTargets();
		this.#vector = Paddle.ReboundVelocity.mul(Field.Diagonal);

		if (bricks.length) {
			if (Sight.brick?.isBreakable)
				this.#releaseTimer();
		} else for (const empty of Demo.getEmptiesBetweenImmoWalls()) {
			getIntersection(
				Demo.Ball.Pos,
				vec2(Demo.Ball.Pos).add(this.#vector),
				vec2(empty.Pos).add(Radius*2, RowHeight),
				vec2(empty.Pos).add(ColWidth-Radius*2, RowHeight)
			) && this.#releaseTimer();
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
		} else {
			moveTo(Field.Left, mag, step);
			if (Paddle.Pos.x < Paddle.MoveMin)
				this.#dir *= -1;
		}
	}
};
function moveTo(dstX, mag, step) {
	for (let i=0; i<step; i++) {
		if (dstX < Paddle.CenterX) Paddle.Pos.x -= mag/step;
		if (dstX > Paddle.CenterX) Paddle.Pos.x += mag/step;
	}		
}
$on('Reset Start', function() {
	Timer.cancel(CatchMode);
	$shakeAngle = 0;
	$target     = null;
	$landingPos = null;
});
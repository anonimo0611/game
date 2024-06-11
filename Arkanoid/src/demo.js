import {Ticker}   from '../lib/timer.js';
import {cvs,ctx}  from './_canvas.js';
import {Game}     from './_main.js';
import {Scene}    from './scene.js';
import {Field}    from './field.js';
import {BallMgr}  from './ball.js';
import {BrickMgr} from './brick.js';
import {Paddle}   from './paddle.js';
import {Sight}    from './sight.js';
import {Army}     from './army.js';
import {ItemMgr}  from './item.js';
import {ItemType} from './item.js';

const {Type,Cols,Rows,ColWidth,RowHeight}= BrickMgr;
const AlwaysAimingStageSet = new Set([5,11]);

let $shakeAngle = 0;
let $target     = null;
let $landingPos = null;

export const Demo = new class {
	get Ball() {return BallMgr.NearlyBall}
	get canFire() {
		return (
			this.#canFireBricksWithLaser ||
			this.#canFireArmyWithLaser);
	}
	get #canFireBricksWithLaser() {
		const data = BrickMgr.MapData.flat().reverse();
		for (const {isNone,type,x,Width:w} of data) {
			if (isNone) continue;
			if (x  >= Paddle.CenterX-ColWidth*2
			&& x+w <= Paddle.CenterX+ColWidth*2)
				return type != Type.Immortality;
		} return false;
	}
	get #canFireArmyWithLaser() {
		for (const {Pos,Width:w,tilePosFromCenter} of Army.ArmySet) {
			if (Pos.x   >= Paddle.CenterX-w
			 && Pos.x+w <= Paddle.CenterX+w) {
				const {row,col}= tilePosFromCenter;
				for (let i=row+1; i<Rows; i++)
					if (BrickMgr.MapData[i]?.[col]?.exists)
						return false;
				return true;
			}
		} return false;
	}
	getBrickTargets() {
		return BrickMgr.MapData.flat().reverse().filter(b=> {
			if (b.isNone || b.isImmortality) return false;
			for (let i=b.row+1, col=b.col; i<Rows-b.row; i++) {
				const b = BrickMgr.MapData[i][col];
				if (!b.isNone || b.isImmortality) return false;
			} return true;
		});
	}
	getEmptiesBetweenImmoWalls() {
		for (let i=BrickMgr.MapData.length-1; i>=0; i--) {
			const row = BrickMgr.MapData[i];
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
		if (this.#paddleToItem(ItemMgr.Current))
			return;
		if (Paddle.CatchEnabled) {
			Paddle.CatchX
				? CatchMode.autoPlay()
				: this.#paddleToBall(mag);
			return;
		}	
		if ($landingPos && $target?.Pos && !Paddle.DisruptEnabled) {
			this.#aimingAtTargetBrick();
			return;
		}
		this.#paddleToBall(mag);
	}
	#paddleToBall(mag) {
		const x = this.Ball.Pos.x * (sin($shakeAngle)/10+1);
		moveTo(x, mag*1.2);
	}
	#paddleToItem(item) {
		const Type  = item?.Type;
		const BallV = this.Ball.Velocity.y;
		if (!item || !this.Ball.isOnWall && BallV > 0)      return false;
		if (Paddle.CatchEnabled && Type == ItemType.Expand) return false;
		if (Paddle.LaserEnabled && Type == ItemType.Expand) return false;
		moveTo(item.CenterX, cvs.width/50);
		return true;
	}
	#aimingAtTargetBrick() {
		const {ReboundAngleMax:aMax,Width:w}= Paddle;
		const angle = Vec2.angle($target?.Pos, $landingPos) + PI/2;
		let pos = $landingPos.x - w * norm(-aMax*2, +aMax*2, angle);
		moveTo(pos + w/2, cvs.width/60);
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
		if (!BrickMgr.isBreakable($target ?? {})) {
			const targets = this.getBrickTargets();
			if (targets.length == 0)
				return void this.#setEmptyTarget();
			if (AlwaysAimingStageSet.has(Game.stageNum)
			 || BrickMgr.remains <= 15) {
				const target = randChoice(targets);
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
	static {$ready(this.#setup)}
	static #setup() {
		$(BallMgr).on({Cought: ()=> CatchMode.#onCatch()});
	}
	#dir    = 1;
	#vector = vec2();
	#aiming = false;
	#onCatch() {
		if (!Scene.isInDemo) return;
		this.#dir = 1;
		this.#aiming = false;
	 	Ticker.Timer.cancel(CatchMode)
	 		.set(1500, this.#release, {id:CatchMode});
	}
	#releaseTimer() {
		if (this.#aiming) return;
		this.#aiming = true;
	 	Ticker.Timer.cancel(CatchMode)
	 		.set(200, this.#release, {id:CatchMode});
	}
	#release() {
		$(Demo).trigger('Release');
	}
	autoPlay() {
		const Radius = BallMgr.Radius;
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
		const spd = Field.Width/60;
		if (this.#dir > 0) {
			moveTo(Field.Right, spd, spd);
			if (Paddle.Pos.x > Paddle.MoveMax)
				this.#dir *= -1;
		} else {
			moveTo(Field.Left, spd, spd);
			if (Paddle.Pos.x < Paddle.MoveMin)
				this.#dir *= -1;
		}
	}
};
function moveTo(dstX, spd, mag=Demo.Ball.Velocity.magnitude) {
	for (let i=0; i<mag; i++) {
		if (dstX < Paddle.CenterX) Paddle.Pos.x -= spd/mag;
		if (dstX > Paddle.CenterX) Paddle.Pos.x += spd/mag;
	}		
}
$on('Reset Start', function() {
	$shakeAngle = 0;
	$target     = null;
	$landingPos = null;
});
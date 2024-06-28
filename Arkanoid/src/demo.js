import {Vec2}     from '../lib/vec2.js';
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

const {Cols,Rows,ColWidth,RowHeight,isBreakable}= BrickMgr;
const AlwaysAimingStageSet = new Set([5,11]);

let $shakeAngle = 0;
let $target     = null;
let $landingPos = null;

$on('Reset InGame', ()=> {
	$shakeAngle = 0;
	$target     = null;
	$landingPos = null;
});

export const Demo = new class {
	get Ball() {
		return BallMgr.NearlyBall
	}
	get canFireLaser() {
		return (
			this.#canShootBricksWithLaser ||
			this.#canShootArmyWithLaser);
	}
	get #canShootBricksWithLaser() {
		return [-ColWidth/2, ColWidth/2].flatMap(offset=> {
			for (const brick of BrickMgr.MapData.flat().reverse()) {
				if (brick.isNone) {
					continue;
				}
				if (brick.containsX(Paddle.centerX+offset)) {
					return brick.isBreakable || [];
				}
			} return [];
		}).length > 0;
	}
	get #canShootArmyWithLaser() {
		for (const {x,Width:w,TilePos} of Army.ArmySet) {
			if (x   >= Paddle.centerX-w
			 && x+w <= Paddle.centerX+w) {
				const {row,col}= TilePos;
				for (let i=row+1; i<Rows; i++) {
					if (BrickMgr.MapData[i]?.[col]?.exists) {
						return false;
					}
				}
				return true;
			}
		} return false;
	}
	get brickTargets() {
		return BrickMgr.MapData.flat().reverse().filter(brick=> {
			const {row,col}= brick;
			if (!brick.isBreakable) {
				return false;
			}
			for (let y=row+1; y<Rows-row; y++) {
				if (!BrickMgr.MapData[y][col].isNone) {
					return false;
				}
			}
			return true;
		});
	}
	get emptiesBetweenImmortality() {
		for (let i=BrickMgr.MapData.length-1; i>=0; i--) {
			const row = BrickMgr.MapData[i];
			if (row.some(b=> b.isImmortality)) {
				return row.filter(b=> b.isNone);
			}
		}
	}
	#setLandingPointOfBall() {
		const ballVector = Vec2.add(
			this.Ball.Pos,
			this.Ball.Velocity.normalized.mul(Field.Diagonal)
		);
		$landingPos = Vec2.getIntersection(
			Vec2(Field.Left,  Paddle.y),
			Vec2(Field.Right, Paddle.y),
			this.Ball.Pos, ballVector
		);
	}
	#setTarget() {
		if (!isBreakable($target ?? {}) || Ticker.count % 120 == 0) {
			const {brickTargets}= this;
			const alwaysAiming = AlwaysAimingStageSet.has(Game.stageNum);
			if (brickTargets.length == 0) {
				return void this.#setEmptyTarget();
			}
			if (alwaysAiming || BrickMgr.remains <= 15) {
				const {x,y,col,row}= randChoice(brickTargets);
				const ox = randFloat(0, ColWidth);
				const oy = randFloat(0, RowHeight);
				$target = {col,row,Pos:Vec2(x,y).add(ox,oy)};
			}
		}
	}
	#setEmptyTarget() {
		if (Ticker.count % 120 == 0) {
			const {x,y,col,row}= randChoice(this.emptiesBetweenImmortality);
			const ox = randFloat(0, ColWidth);
			const oy = randFloat(0, RowHeight);
			$target = {col,row,Pos:Vec2(x,y).add(ox,oy)};
		}
	}
	update() {
		if (!Scene.isInDemo) {
			return;
		}
		this.#setTarget();
		this.#setLandingPointOfBall();
	}
	autoPlay() {
		if (this.#paddleMoveToItem(ItemMgr.Current)) {
			return;
		}
		if (Paddle.CatchEnabled) {
			Paddle.catchX
				? CatchMode.autoPlay()
				: this.#paddleMoveToBall();
			return;
		}
		if ($landingPos && $target?.Pos) {
			this.#aimingAtTargetBrick();
			return;
		}
		this.#paddleMoveToBall();
	}
	#paddleMoveToBall() {
		const x = this.Ball.x * (sin($shakeAngle+=PI/100)/10+1);
		moveTo(x, this.Ball.Velocity.magnitude*1.2);
	}
	#paddleMoveToItem(item) {
		const Type  = item?.Type;
		const BallV = this.Ball.Velocity.y;
		if (!item || !this.Ball.isOnWall && BallV > 0) {
			return false;
		}
		if (Paddle.CatchEnabled
		 || Paddle.LaserEnabled) {
			if (Type == ItemType.Expand) {
				return false;
			}
		}
		moveTo(item.centerX, cvs.width/50);
		return true;
	}
	#aimingAtTargetBrick() {
		const {BounceAngleMax:aMax,Width:w,centerX}= Paddle;
		const angle = Vec2.toRadians($target.Pos, $landingPos) + PI/2;
		const destX = $landingPos.x - w * norm(-aMax, +aMax, angle) + w/2;
		moveTo(destX, this.Ball.Velocity.magnitude);
	}
	#drawPoint(pos, r, color) { // For debug
		fillCircle  (ctx)(...pos.vals, r, color);
		strokeCircle(ctx)(...pos.vals, r, 3, '#FFF');
	}
	draw() { // For debug
		return;
		$target     && this.#drawPoint($target.Pos, 10, '#F33');
		$landingPos && this.#drawPoint($landingPos, 10, '#F33');
	}
}
const CatchMode = new class {
	static {$ready(this.#setup)}
	static #setup() {
		$(BallMgr).on({Cought: ()=> CatchMode.#onCatch()});
	}
	#dirX   = 1;
	#aiming = false;
	#onCatch() {
		if (!Scene.isInDemo) {
			return;
		}
		this.#dirX   = 1;
		this.#aiming = false;
	 	Ticker.Timer.cancel(CatchMode).set(1500, this.#release, {id:CatchMode});
	}
	#release() {
		$(Demo).trigger('Release');
	}
	#releaseTimer() {
		if (this.#aiming) {
			return;
		}
		this.#aiming = true;
	 	Ticker.Timer.cancel(CatchMode).set(200, this.#release);
	}
	autoPlay() {
		const Radius = BallMgr.Radius;
		const bricks = Demo.brickTargets;
		const vector = Paddle.BounceVelocity.mul(Field.Diagonal);

		if (bricks.length) {
			if (Sight.brick?.isBreakable) {
				this.#releaseTimer();
			}
		} else for (const empty of Demo.emptiesBetweenImmortality) {
			Vec2.getIntersection(
				Demo.Ball.Pos,
				Vec2(Demo.Ball.Pos).add(vector),
				Vec2(empty.Pos).add(Radius*2, RowHeight),
				Vec2(empty.Pos).add(ColWidth-Radius*2, RowHeight)
			) && this.#releaseTimer();
		}
		this.#searchMove();
	}
	#searchMove() {
		if (this.#aiming) {
			return;
		}
		Paddle.Pos.x += (Field.Width/60) * this.#dirX;
		if (Paddle.x < Paddle.MoveMin
		 || Paddle.x > Paddle.MoveMax)
			this.#dirX *= -1;
	}
};
function moveTo(dstX, speed) {
	for (let i=0; i<speed; i++) {
		dstX < Paddle.centerX && Paddle.Pos.x--;
		dstX > Paddle.centerX && Paddle.Pos.x++;
	}
}
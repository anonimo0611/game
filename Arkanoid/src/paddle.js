import {Sound}     from '../snd/sound.js';
import {Ticker}    from '../lib/timer.js';
import {Confirm}   from '../lib/confirm.js';
import {hsl,rgba}  from '../lib/color.js';
import {cvs,ctx}   from './_canvas.js';
import {Game}      from './_main.js';
import {Demo}      from './demo.js';
import {Field}     from './field.js';
import {Scene}     from './scene.js';
import {Lives}     from './lives.js';
import {ItemMgr}   from './item.js';
import {ItemType}  from './item.js';
import {ExclTypes} from './item.js';
import {BallMgr}   from './ball.js';
import {BrickMgr}  from './brick.js';
import {Mouse}     from './mouse.js';

const Width  = cvs.width / 5;
const Height = BrickMgr.RowHeight;

const StretchMax  = Width * 1.5;
const StretchSpd  = (StretchMax-Width)/(300/Ticker.Interval);
const FadeSpeed   = 500 / Ticker.Interval;
const SparkColor  = rgba(0,255,255, 0.7);
const ShadowColor = rgba(0,  0,  0, 0.4);
const [$cvs,$ctx] = canvas2D(null, Width*1.5, Height*1.5).vals;

export const Paddle = freeze(new class {
	static {$ready(this.#setup)}
	static #setup() {
		$on({Dropped:   Paddle.#onDropped});
		$on({Resume:    Paddle.#onResume});
		$on({mousedown: Paddle.#onLaunch});
		$on({mousedown: Paddle.#onRelease});
		$(Demo)   .on({Release:  Paddle.#onRelease});
		$(BallMgr).on({Cought:   Paddle.#onCatch});
		$(ItemMgr).on({Obtained: Paddle.#onPowerUp});
	}
	#alpha    = 0;
	#blink    = 0;
	#CatchX   = 0;
	#ExclItem = null;
	#Launched = false;
	#Width    = Width;
	#TargetW  = Width;
	DefaultW  = Width;
	Height    = Height;
	Pos = vec2(0, cvs.height - this.Height*3.2).yFreeze();

	ReboundAngleMax = (112 * PI/180);

	get x()        {return this.Pos.x}
	get y()        {return this.Pos.y}
	get alpha()    {return this.#alpha}
	get blink()    {return this.#blink}
	get Launched() {return this.#Launched}
	get Width()    {return this.#Width}
	get CatchX()   {return this.#CatchX}
	get CenterX()  {return this.x+this.Width/2}
	get ClampedX() {return clamp(this.x, this.MoveMin, this.MoveMax)}
	get MoveMin()  {return Field.Left}
	get MoveMax()  {return Field.Right-this.Width}

	// Exclutive item
	get ExclItem()       {return this.#ExclItem}
	get CatchEnabled()   {return this.ExclItem == ItemType.Catch}
	get ExpandEnabled()  {return this.ExclItem == ItemType.Expand}
	get LaserEnabled()   {return this.ExclItem == ItemType.Laser}
	get DisruptEnabled() {return this.ExclItem == ItemType.Disruption}

	get AutoMoveReached() {
		return AutoMoveToCursorX.reached;
	}
	get controllable() {
		return Paddle.alpha == 1 && Paddle.AutoMoveReached;
	}
	get ReboundVelocity() {
		const {x,CenterX:cx,Width:w}= this;
		const ballX = clamp(BallMgr.Ball.x, x, x+w);
		const angle = PI/2 + ((ballX - cx) / w) * this.ReboundAngleMax;
		return vec2(-cos(angle), -sin(angle));
	}
	get canCatch() {
		if (!Paddle.CatchEnabled || Paddle.CatchX)
			return false;
		if (Paddle.Width != Paddle.#TargetW)
			return false;
		return true;
	}
	get CaughtBallPos() {
		const x = this.CatchX? (this.ClampedX+this.CatchX) : this.CenterX;
		return vec2(x, this.y - BallMgr.Radius);
	}
	init() {
		Paddle.#blink    = 0;
		Paddle.#CatchX   = 0;
		Paddle.#alpha    = 0;
		Paddle.#Launched = false;
		if (Game.respawned && Paddle.DisruptEnabled) {
			Paddle.#ExclItem = null;
		}
		if (!Game.respawned) {
			Paddle.#Width    = Width;
			Paddle.#TargetW  = Width;
			Paddle.#ExclItem = null;
		}
		Paddle.Pos.x = (cvs.width - Paddle.Width) / 2;
		Paddle.#updateCache(Lives.context, Width);
		Paddle.#updateCache($ctx);
	}
	update() {
		Paddle.#blink += PI/120;
		Paddle.#updateCache($ctx);
		switch (Scene.current) {
			case Scene.Enum.Reset:
			case Scene.Enum.Ready:
				Paddle.#ready();
				break;
			case Scene.Enum.InDemo:
				Paddle.#inDemo();
				return;
			case Scene.Enum.InGame:
				Paddle.#inGame();
				break;
			default:
				Paddle.#destory();
		}
	}
	#ready() {
		if (Ticker.elapsed > Game.ReadyTime - 1000)
			Paddle.#alpha = min(Paddle.#alpha+1/FadeSpeed, 1);
	}
	#inDemo() {
		if (Ticker.elapsed >= 50)
			Paddle.#Launched ||= true;
		if (Ticker.elapsed < 200)
			return;

		Demo.autoPlay();
		Paddle.#moveCaughtBall();
		Paddle.#setWidth();
		Paddle.#restrictRangeOfMove();
	}
	#inGame() {
		if (Ticker.elapsed < 50)
			return;

		if (AutoMoveToCursorX.setPosition()) {
			Paddle.Pos.x = Mouse.x - (Paddle.Width/2);
			Paddle.#setWidth();
			Paddle.#restrictRangeOfMove();
			Paddle.#moveCaughtBall();
		}
		if (!Paddle.Launched)
			BallMgr.Ball.Pos.x = Paddle.CatchX
				? Paddle.ClampedX + Paddle.CatchX
				: Paddle.ClampedX + Paddle.Width/2;
	}
	#onCatch(_, ball) {
		const {x,y}= Paddle.Pos;
		ball.Pos.x = clamp(ball.x, x+1, x+Paddle.Width-1);
		ball.Pos.y = y - ball.Radius;
		Paddle.#CatchX = ball.x - Paddle.x;
	}
	#restrictRangeOfMove() {
		const {Pos,MoveMin,MoveMax}= Paddle;
		Pos.x = clamp(Pos.x, MoveMin, MoveMax);
	}
	#moveCaughtBall() {
		if (Paddle.CatchX > 0)
			BallMgr.Ball.Pos.x = Paddle.CaughtBallPos.x;
	}
	#destory() {
		if (BallMgr.count <= 0 && Ticker.count > 8)
			Paddle.#alpha = max(Paddle.#alpha-1/FadeSpeed, 0);
	}
	#onLaunch(e) {
		if (!Game.acceptEventInGame(e))
			return;
		if (!AutoMoveToCursorX.reached || Paddle.Launched)
			return;

		Paddle.#Launched = true;
		Sound.play('se0');
	}
	#onRelease(e) {
		if (!Paddle.CatchX)
			return;
		if (!Scene.isInDemo && !Game.acceptEventInGame(e))
			return;

		Sound.play('se0');
		Paddle.#CatchX = 0;
	}
	#onResume() {
		Paddle.CatchX && (Paddle.#Launched = false);
	}
	#onPowerUp(_, type) {
		switch (type) {
		case ItemType.Extend:
			Lives.extend();
			break;
		case ItemType.Catch:
		case ItemType.Disruption:
		case ItemType.Expand:
		case ItemType.Laser:
			Paddle.#ExclItem = type;
			Paddle.#TargetW  = type == ItemType.Expand ? StretchMax : Width;
			Paddle.#updateCache($ctx);
			break;
		}
		if (ExclTypes.includes(type))
			Paddle.#CatchX = 0;
	}
	#onDropped() {
		Paddle.#updateCache($ctx);
		Sound.play('destroy');
	}
	#setWidth() {
		if (Paddle.#TargetW > Paddle.#Width) {
			Paddle.#Width = min(Paddle.#Width+StretchSpd, Paddle.#TargetW);
			Paddle.#updateCache($ctx);
		}
		if (Paddle.#TargetW < Paddle.#Width) {
			Paddle.#Width = max(Paddle.#Width-StretchSpd, Width);
			Paddle.#updateCache($ctx);
		}
	}
	#getPaddleType(ctx) {
		if (ctx != $ctx)
			return;
		switch (Paddle.ExclItem) {
		case ItemType.Catch:
		case ItemType.Laser:
			return Paddle.ExclItem;
		}
	}
	#updateCache(ctx, w=Paddle.Width) {
		ctx.clear();
		Paddle.#cache(ctx, w, ShadowColor); // shadow
		Paddle.#cache(ctx, w);
	}
	#cache(ctx, w, shadowColor) {
		const type  = Paddle.#getPaddleType(ctx) ?? undefined;
		const lineW = Width*0.05, r = Height/2;

		ctx.save();
		if (shadowColor)
			ctx.translate(r, r);
		if (BallMgr.count <= 0)
			ctx.filter = 'grayscale(100%)';

		// Both side spheres
		for (let i=0; i<2; i++) {
			ctx.save();
			ctx.translate((!i ? r*2 - r : w-r*2 + r), r);
			ctx.beginPath();
				ctx.fillStyle = shadowColor ?? Grad.Sphere.get(type)()[i];
				ctx.arc(0,0, r, PI/2,-PI/2, !!i);
				ctx.lineTo((!i ? r-lineW : -r+lineW), -r);
				ctx.lineTo((!i ? r-lineW : -r+lineW), +r);
			ctx.fill();
			ctx.restore();
		}
		// Both side vertical lines
		ctx.fillStyle = shadowColor ?? Grad.Line.get(type);
		for (let i=0; i<2; i++)
			ctx.fillRect(!i ? (r*2 - lineW) : (w - r*2), 0, lineW, Height);

		// Horizontal bar
		ctx.fillStyle = shadowColor ?? Grad.Body;
		ctx.fillRect(r*2, 0, w-r*4, Height);

		ctx.restore();
	}
	draw() {
		const {x, y}= Paddle;
		ctx.save();
		ctx.globalAlpha = Paddle.alpha;
		ctx.translate(x, y);
		ctx.drawImage($cvs, 0,0);
		ctx.restore();
		spark();
	}
});

const AutoMoveToCursorX = freeze(new class {
	static {
		$on('InGame Respawn Resume',
			()=> AutoMoveToCursorX.#reached = false);
	}
	#reached  = false;
	get reached() {
		return this.#reached;
	}
	setPosition() {
		if (this.reached) return true;
		for (let i=0; i<int(cvs.width/30); i++)
			if (this.#move()) return true;
		return this.reached;
	}
	#move() {
		const {MoveMin,MoveMax,Pos}= Paddle;
		if (Paddle.CenterX > Mouse.x) {
			Pos.x = max(Pos.x-1, MoveMin);
			if (Paddle.CenterX < Mouse.x || Pos.x == MoveMin)
				return this.#reached = true;
		} else {
			Pos.x = min(Pos.x+1, MoveMax);
			if (Paddle.CenterX > Mouse.x || Pos.x == MoveMax)
				return this.#reached = true;
		}
	}
});

const Grad = freeze(new class {
	Body = this.lineHSL(0, 0, 46);
	Line = new Map()
		.set(undefined,      this.lineHSL( 15, 100, 40))
		.set(ItemType.Catch, this.lineHSL( 33, 240, 29))
		.set(ItemType.Laser, this.lineHSL(240,  33, 29))
	;
	Sphere = new Map()
		.set(undefined,      ()=> this.sphereHSL(210, 100, 38))
		.set(ItemType.Catch, ()=> this.sphereHSL(120, 100, 29))
		.set(ItemType.Laser, ()=> this.sphereHSL(  0, 100, 29))
	;
	lineHSL(h=0,s=0,l=100) {
		const
		gr = $ctx.createLinearGradient(Width,0,Width,Height);
		gr.addColorStop(0.0, hsl(h,s,l));
		gr.addColorStop(0.3, hsl(h,s,90));
		gr.addColorStop(0.4, hsl(h,s,l));
		gr.addColorStop(1.0, hsl(h,s,l*1.1));
		return gr;
	}
	sphereHSL(h=0,s=0,l=100) {
		const radius = Height/2;
		const lightness = max(abs(sin(Paddle.blink))*(l*1.4), l);
		return [0,1].map((_,i)=> { // Both sides
			const sx = (!i ? radius : -radius) / 4;
			const
			gr = $ctx.createRadialGradient(sx,-radius/2,0, 0,0,radius);
			gr.addColorStop(0.0, hsl(h,s,90));
			gr.addColorStop(0.5, hsl(h,s,lightness));
			gr.addColorStop(1.0, hsl(h,s,lightness));
			return gr;
		});
	}
});

function spark() {
	if (Ticker.paused || !Game.isReadyScene)
		return;
	if (Paddle.alpha == 0 || Paddle.alpha == 1)
		return;

	for (let i=0; i<=15; i++) {
		const {Width,Height,Pos}= Paddle;
		const stPos = [randInt(0, Width),randInt(0, Height*1.1)];
		const edVec = stPos.map(c=> c+randChoice(-15, +15));
		ctx.save();
		ctx.translate(...Pos.vals);
		ctx.beginPath();
			ctx.lineWidth   = cvs.width / 230;
			ctx.strokeStyle = SparkColor;
			ctx.moveTo(...stPos);
			ctx.lineTo(...edVec);
		ctx.stroke();
		ctx.restore();
	}
}